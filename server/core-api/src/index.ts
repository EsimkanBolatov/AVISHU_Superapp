import "dotenv/config";

import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:http";

import {
  ContentKind,
  LoyaltyTier,
  MediaKind,
  NotificationType,
  Prisma,
  PriorityLevel,
  Role as PrismaRole,
} from "@prisma/client";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";

import { prisma } from "./prisma.js";
import {
  AppLanguage,
  BootstrapPayload,
  Category,
  ContentEntry as ContentEntryVm,
  DashboardMetrics,
  DeliveryMethod,
  Favorite,
  FunnelMetrics,
  Notification,
  Order,
  OrderStatus,
  PriorityLevel as PriorityLevelVm,
  Product,
  ProductAvailability,
  ProductView,
  Recommendation,
  Reward,
  Role,
  SavedAddress,
  SavedPaymentCard,
  TryOnSession,
  User,
} from "./types.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const port = Number(process.env.PORT ?? 3000);
const SESSION_DAYS = 30;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", async (_request, response) => {
  const [users, products, orders, contentEntries] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.contentEntry.count(),
  ]);

  response.json({ ok: true, users, products, orders, contentEntries });
});

app.get("/api/core/v1/content", async (request, response) => {
  const locale = normalizeLocale(String(request.query.locale ?? "ru"));
  const kind = String(request.query.kind ?? "").trim();

  const rows = await prisma.contentEntry.findMany({
    where: {
      locale,
      ...(kind ? { kind: kind as ContentKind } : {}),
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });

  response.json({ contentEntries: rows.map(serializeContentEntry) });
});

app.post("/api/core/v1/auth/register", async (request, response) => {
  const name = String(request.body?.name ?? "").trim();
  const email = String(request.body?.email ?? "").trim().toLowerCase();
  const password = String(request.body?.password ?? "");

  if (!name || !email || password.length < 8) {
    response.status(400).json({ message: "Name, email and password are required." });
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    response.status(409).json({ message: "Email is already registered." });
    return;
  }

  const createdUser = await prisma.user.create({
    data: {
      id: `u-${randomUUID()}`,
      name,
      email,
      passwordHash: hashPassword(password),
      role: "client",
      loyaltyProgress: 8,
      loyaltyPoints: 120,
      loyaltyTier: "silver",
      segment: "new_client",
    },
  });

  const sessionToken = await createSession(createdUser.id);
  response.status(201).json({ token: sessionToken, user: serializeUser(createdUser) });
});

app.post("/api/core/v1/auth/login", async (request, response) => {
  const email = String(request.body?.email ?? "").trim().toLowerCase();
  const password = String(request.body?.password ?? "");

  if (!email || !password) {
    response.status(400).json({ message: "Email and password are required." });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.passwordHash !== hashPassword(password)) {
    response.status(401).json({ message: "Invalid credentials." });
    return;
  }

  const sessionToken = await createSession(user.id);
  response.json({ token: sessionToken, user: serializeUser(user) });
});

app.get("/api/core/v1/auth/session", authMiddleware, async (request, response) => {
  response.json({ user: request.user });
});

app.post("/api/core/v1/auth/logout", authMiddleware, async (request, response) => {
  await prisma.session.deleteMany({
    where: { token: request.token },
  });

  response.status(204).send();
});

app.patch("/api/core/v1/profile", authMiddleware, async (request, response) => {
  const name = String(request.body?.name ?? request.user.name).trim();
  const phone = String(request.body?.phone ?? request.user.phone ?? "").trim();
  const defaultShippingAddress = String(
    request.body?.defaultShippingAddress ?? request.user.defaultShippingAddress ?? "",
  ).trim();
  const paymentCardBrand = String(
    request.body?.paymentCardBrand ?? request.user.paymentCardBrand ?? "",
  ).trim();
  const paymentCardLast4 = String(
    request.body?.paymentCardLast4 ?? request.user.paymentCardLast4 ?? "",
  ).trim();
  const paymentCardHolder = String(
    request.body?.paymentCardHolder ?? request.user.paymentCardHolder ?? "",
  ).trim();

  const updatedUser = await prisma.user.update({
    where: { id: request.user.id },
    data: {
      name,
      phone: phone || null,
      defaultShippingAddress: defaultShippingAddress || null,
      paymentCardBrand: paymentCardBrand || null,
      paymentCardLast4: paymentCardLast4 || null,
      paymentCardHolder: paymentCardHolder || null,
    },
  });

  response.json({ user: serializeUser(updatedUser) });
});

app.post("/api/core/v1/profile/addresses", authMiddleware, async (request, response) => {
  const payload = parseAddressPayload(request.body);

  if (!payload.label || !payload.city || !payload.line1) {
    response.status(400).json({ message: "Address payload is incomplete." });
    return;
  }

  if (payload.isDefault) {
    await prisma.savedAddress.updateMany({
      where: { userId: request.user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.savedAddress.create({
    data: {
      id: `addr-${randomUUID()}`,
      userId: request.user.id,
      ...payload,
    },
  });

  await syncUserDefaults(request.user.id);
  response.status(201).json({
    address: serializeSavedAddress(address),
    user: await getSerializedUser(request.user.id),
  });
});

app.patch("/api/core/v1/profile/addresses/:id", authMiddleware, async (request, response) => {
  const addressId = getRouteId(request.params.id);
  const existing = await prisma.savedAddress.findFirst({
    where: {
      id: addressId,
      userId: request.user.id,
    },
  });

  if (!existing) {
    response.status(404).json({ message: "Address not found." });
    return;
  }

  const payload = parseAddressPayload(request.body);

  if (payload.isDefault) {
    await prisma.savedAddress.updateMany({
      where: { userId: request.user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.savedAddress.update({
    where: { id: addressId },
    data: payload,
  });

  await syncUserDefaults(request.user.id);
  response.json({
    address: serializeSavedAddress(address),
    user: await getSerializedUser(request.user.id),
  });
});

app.delete("/api/core/v1/profile/addresses/:id", authMiddleware, async (request, response) => {
  const addressId = getRouteId(request.params.id);
  const existing = await prisma.savedAddress.findFirst({
    where: {
      id: addressId,
      userId: request.user.id,
    },
  });

  if (!existing) {
    response.status(404).json({ message: "Address not found." });
    return;
  }

  await prisma.savedAddress.delete({
    where: { id: addressId },
  });

  await ensureAddressDefault(request.user.id);
  await syncUserDefaults(request.user.id);
  response.status(204).send();
});

app.post("/api/core/v1/profile/cards", authMiddleware, async (request, response) => {
  const payload = parseCardPayload(request.body);

  if (!payload.brand || !payload.holderName || payload.last4.length !== 4) {
    response.status(400).json({ message: "Card payload is incomplete." });
    return;
  }

  if (payload.isDefault) {
    await prisma.savedPaymentCard.updateMany({
      where: { userId: request.user.id },
      data: { isDefault: false },
    });
  }

  const card = await prisma.savedPaymentCard.create({
    data: {
      id: `card-${randomUUID()}`,
      userId: request.user.id,
      ...payload,
    },
  });

  await syncUserDefaults(request.user.id);
  response.status(201).json({
    card: serializeSavedCard(card),
    user: await getSerializedUser(request.user.id),
  });
});

app.patch("/api/core/v1/profile/cards/:id", authMiddleware, async (request, response) => {
  const cardId = getRouteId(request.params.id);
  const existing = await prisma.savedPaymentCard.findFirst({
    where: {
      id: cardId,
      userId: request.user.id,
    },
  });

  if (!existing) {
    response.status(404).json({ message: "Card not found." });
    return;
  }

  const payload = parseCardPayload(request.body);

  if (payload.isDefault) {
    await prisma.savedPaymentCard.updateMany({
      where: { userId: request.user.id },
      data: { isDefault: false },
    });
  }

  const card = await prisma.savedPaymentCard.update({
    where: { id: cardId },
    data: payload,
  });

  await syncUserDefaults(request.user.id);
  response.json({
    card: serializeSavedCard(card),
    user: await getSerializedUser(request.user.id),
  });
});

app.delete("/api/core/v1/profile/cards/:id", authMiddleware, async (request, response) => {
  const cardId = getRouteId(request.params.id);
  const existing = await prisma.savedPaymentCard.findFirst({
    where: {
      id: cardId,
      userId: request.user.id,
    },
  });

  if (!existing) {
    response.status(404).json({ message: "Card not found." });
    return;
  }

  await prisma.savedPaymentCard.delete({
    where: { id: cardId },
  });

  await ensureCardDefault(request.user.id);
  await syncUserDefaults(request.user.id);
  response.status(204).send();
});

app.get("/api/core/v1/bootstrap", authMiddleware, async (request, response) => {
  response.json(await buildBootstrap(request.user));
});

app.post("/api/core/v1/client/products/:productId/view", authMiddleware, async (request, response) => {
  if (request.user.role !== "client") {
    response.status(403).json({ message: "Only clients can track product views." });
    return;
  }

  const productId = getRouteId(request.params.productId);
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    response.status(404).json({ message: "Product not found." });
    return;
  }

  const productView = await prisma.productView.create({
    data: {
      id: `view-${randomUUID()}`,
      userId: request.user.id,
      productId,
    },
  });

  response.status(201).json({ view: serializeProductView(productView) });
});

app.post("/api/core/v1/client/favorites/:productId", authMiddleware, async (request, response) => {
  if (request.user.role !== "client") {
    response.status(403).json({ message: "Only clients can save favorites." });
    return;
  }

  const productId = getRouteId(request.params.productId);
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    response.status(404).json({ message: "Product not found." });
    return;
  }

  const existing = await prisma.productFavorite.findFirst({
    where: {
      userId: request.user.id,
      productId,
    },
  });

  if (existing) {
    response.json({ favorite: serializeFavorite(existing), active: true });
    return;
  }

  const favorite = await prisma.productFavorite.create({
    data: {
      id: `fav-${randomUUID()}`,
      userId: request.user.id,
      productId,
    },
  });

  response.status(201).json({ favorite: serializeFavorite(favorite), active: true });
});

app.delete("/api/core/v1/client/favorites/:productId", authMiddleware, async (request, response) => {
  if (request.user.role !== "client") {
    response.status(403).json({ message: "Only clients can remove favorites." });
    return;
  }

  const productId = getRouteId(request.params.productId);

  await prisma.productFavorite.deleteMany({
    where: {
      userId: request.user.id,
      productId,
    },
  });

  response.status(204).send();
});

app.patch("/api/core/v1/notifications/:id/read", authMiddleware, async (request, response) => {
  const notificationId = getRouteId(request.params.id);

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      OR: [{ userId: request.user.id }, { roleTarget: request.user.role as PrismaRole }],
    },
  });

  if (!notification) {
    response.status(404).json({ message: "Notification not found." });
    return;
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      readAt: new Date(),
    },
  });

  await emitRealtimeSnapshots();
  response.json({ notification: serializeNotification(updated) });
});

app.post("/api/core/v1/try-ons", authMiddleware, async (request, response) => {
  if (request.user.role !== "client") {
    response.status(403).json({ message: "Only clients can create try-on sessions." });
    return;
  }

  const productId = String(request.body?.productId ?? "");
  const sourceImageUrl = String(request.body?.sourceImageUrl ?? "").trim();
  const notes = String(request.body?.notes ?? "Client uploaded a new try-on reference.").trim();

  if (!productId || !sourceImageUrl) {
    response.status(400).json({ message: "productId and sourceImageUrl are required." });
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) {
    response.status(404).json({ message: "Product not found." });
    return;
  }

  const tryOn = await prisma.tryOnSession.create({
    data: {
      id: `to-${randomUUID()}`,
      userId: request.user.id,
      productId,
      sourceImageUrl,
      resultImageUrl: product.media[0]?.url ?? sourceImageUrl,
      status: "ready",
      notes,
    },
  });

  response.status(201).json({ tryOn: serializeTryOn(tryOn) });
});

app.post("/api/core/v1/orders", authMiddleware, async (request, response) => {
  if (request.user.role !== "client") {
    response.status(403).json({ message: "Only clients can create orders." });
    return;
  }

  const productId = String(request.body?.productId ?? "");
  const variantId = String(request.body?.variantId ?? "");
  const paymentMethod = String(request.body?.paymentMethod ?? "") as DeliveryMethod;
  const deliveryMethod = String(request.body?.deliveryMethod ?? "") as DeliveryMethod;
  const shippingAddress = String(request.body?.shippingAddress ?? "").trim();
  const contactPhone = String(request.body?.contactPhone ?? "").trim();
  const scheduledDate = String(request.body?.scheduledDate ?? "").trim();
  const notes = String(request.body?.notes ?? "").trim();
  const tryOnId = String(request.body?.tryOnId ?? "").trim();

  if (!productId || !variantId || !paymentMethod || !deliveryMethod || !shippingAddress || !contactPhone) {
    response.status(400).json({ message: "Checkout data is incomplete." });
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    response.status(404).json({ message: "Product not found." });
    return;
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant || variant.productId !== productId) {
    response.status(404).json({ message: "Variant not found." });
    return;
  }

  const orderCount = await prisma.order.count();
  const timestamp = new Date();
  const dueAt = addHours(timestamp, 48);

  const createdOrder = await prisma.order.create({
    data: {
      id: `o-${randomUUID()}`,
      number: `AV-${timestamp.toISOString().slice(2, 10).replace(/-/g, "")}-${String(orderCount + 1).padStart(3, "0")}`,
      productId,
      variantId,
      customerId: request.user.id,
      tryOnId: tryOnId || null,
      status: "pending_franchisee",
      paymentStatus: "paid",
      deliveryMethod,
      paymentMethod: paymentMethod as never,
      priority: "standard",
      notes: notes || buildDefaultOrderNote(product.availability as ProductAvailability, scheduledDate),
      shippingAddress,
      contactPhone,
      scheduledDate: scheduledDate ? new Date(`${scheduledDate}T00:00:00.000Z`) : null,
      dueAt,
      totalAmount: product.priceAmount,
      currency: product.currency,
      slaHours: 48,
    },
    include: orderInclude,
  });

  await prisma.orderAuditLog.create({
    data: {
      id: `audit-${randomUUID()}`,
      orderId: createdOrder.id,
      actorId: request.user.id,
      actorName: request.user.name,
      actorRole: request.user.role as PrismaRole,
      action: "order_created",
      message: "Client created a new order.",
    },
  });

  await createNotificationForRole(
    "franchisee",
    "order_action",
    createdOrder.id,
    "New client order",
    `${createdOrder.number} is waiting for franchisee intake.`,
  );

  await createNotificationForUser(
    request.user.id,
    "order_status",
    createdOrder.id,
    "Order confirmed",
    `${createdOrder.number} entered the live operations flow.`,
  );

  await emitRealtimeSnapshots();

  const hydratedOrder = await prisma.order.findUnique({
    where: { id: createdOrder.id },
    include: orderInclude,
  });

  response.status(201).json({ order: serializeOrder(hydratedOrder!) });
});

app.patch("/api/core/v1/orders/:id/status", authMiddleware, async (request, response) => {
  const orderId = getRouteId(request.params.id);
  const nextStatus = String(request.body?.status ?? "") as OrderStatus;

  if (!nextStatus) {
    response.status(400).json({ message: "status is required." });
    return;
  }

  try {
    const result = await updateOrderWorkflowInternal({
      actor: request.user,
      orderId,
      payload: {
        status: nextStatus,
        notifyClient: true,
      },
    });

    response.json({ order: result });
  } catch (error) {
    response.status(error instanceof Error && error.message === "Order not found." ? 404 : 403).json({
      message: error instanceof Error ? error.message : "Workflow update failed.",
    });
  }
});

app.patch("/api/core/v1/orders/:id/workflow", authMiddleware, async (request, response) => {
  const orderId = getRouteId(request.params.id);
  const payload = parseWorkflowPayload(request.body);

  try {
    const result = await updateOrderWorkflowInternal({
      actor: request.user,
      orderId,
      payload,
    });

    response.json({ order: result });
  } catch (error) {
    response.status(error instanceof Error && error.message === "Order not found." ? 404 : 403).json({
      message: error instanceof Error ? error.message : "Workflow update failed.",
    });
  }
});

app.post("/api/core/v1/orders/:id/comments", authMiddleware, async (request, response) => {
  const orderId = getRouteId(request.params.id);
  const message = String(request.body?.message ?? "").trim();

  if (!message) {
    response.status(400).json({ message: "message is required." });
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    response.status(404).json({ message: "Order not found." });
    return;
  }

  await prisma.orderComment.create({
    data: {
      id: `oc-${randomUUID()}`,
      orderId,
      authorId: request.user.id,
      message,
    },
  });

  await prisma.orderAuditLog.create({
    data: {
      id: `audit-${randomUUID()}`,
      orderId,
      actorId: request.user.id,
      actorName: request.user.name,
      actorRole: request.user.role as PrismaRole,
      action: "comment_added",
      message,
    },
  });

  if (request.user.role !== "client") {
    await createNotificationForUser(
      order.customerId,
      "order_action",
      order.id,
      "Order note updated",
      `${request.user.name} added a new operational note to ${order.number}.`,
    );
  }

  await emitRealtimeSnapshots();

  const updatedOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  response.status(201).json({ order: serializeOrder(updatedOrder!) });
});

app.post("/api/core/v1/orders/:id/attachments", authMiddleware, async (request, response) => {
  if (request.user.role === "client") {
    response.status(403).json({ message: "Client cannot add attachments." });
    return;
  }

  const orderId = getRouteId(request.params.id);
  const label = String(request.body?.label ?? "").trim();
  const url = String(request.body?.url ?? "").trim();

  if (!label || !url) {
    response.status(400).json({ message: "label and url are required." });
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    response.status(404).json({ message: "Order not found." });
    return;
  }

  await prisma.orderAttachment.create({
    data: {
      id: `oa-${randomUUID()}`,
      orderId,
      authorId: request.user.id,
      label,
      url,
    },
  });

  await prisma.orderAuditLog.create({
    data: {
      id: `audit-${randomUUID()}`,
      orderId,
      actorId: request.user.id,
      actorName: request.user.name,
      actorRole: request.user.role as PrismaRole,
      action: "attachment_added",
      message: `${request.user.name} attached ${label}.`,
    },
  });

  await emitRealtimeSnapshots();

  const updatedOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  response.status(201).json({ order: serializeOrder(updatedOrder!) });
});

app.post("/api/core/v1/admin/products", authMiddleware, async (request, response) => {
  if (request.user.role !== "admin") {
    response.status(403).json({ message: "Only admin role can manage catalog." });
    return;
  }

  const payload = parseProductPayload(request.body);

  if (!payload.name || !payload.categoryId || !payload.coverUrl || !payload.sizeLabels.length) {
    response.status(400).json({ message: "Catalog payload is incomplete." });
    return;
  }

  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    response.status(404).json({ message: "Category not found." });
    return;
  }

  const slugBase = slugify(payload.name);
  const existingCount = await prisma.product.count();
  const productId = `p-${randomUUID()}`;
  const slug = `${slugBase}-${existingCount + 1}`;
  const sku = `AV-AUTO-${String(existingCount + 1).padStart(3, "0")}`;

  const createdProduct = await prisma.product.create({
    data: {
      id: productId,
      slug,
      sku,
      name: payload.name,
      subtitle: payload.subtitle,
      priceAmount: payload.priceAmount,
      availability: payload.availability as never,
      style: payload.style,
      description: payload.description,
      composition: payload.composition,
      fittingNotes: payload.fittingNotes,
      deliveryEstimate: payload.deliveryEstimate,
      featured: payload.featured,
      categoryId: payload.categoryId,
      brandName: payload.brandName,
      collectionName: payload.collectionName,
      dropName: payload.dropName,
      seasonLabel: payload.seasonLabel,
      limitedEdition: payload.limitedEdition,
      limitedQuantity: payload.limitedQuantity,
      colors: payload.colors,
      materials: payload.materials,
      fitProfile: payload.fitProfile,
      careInstructions: payload.careInstructions,
      sizeGuide: payload.sizeGuide,
      editorialStory: payload.editorialStory,
      relatedProductIds: payload.relatedProductIds,
      crossSellProductIds: payload.crossSellProductIds,
      media: {
        create: buildMediaRows(payload.name, payload.coverUrl, payload.galleryUrls),
      },
      variants: {
        create: payload.sizeLabels.map((sizeLabel) => ({
          id: `pv-${randomUUID()}`,
          sizeLabel,
          colorLabel: payload.colors[0] ?? null,
          stock: payload.defaultStock,
        })),
      },
    },
    include: productInclude,
  });

  response.status(201).json({ product: serializeProduct(createdProduct) });
});

app.patch("/api/core/v1/admin/products/:id", authMiddleware, async (request, response) => {
  if (request.user.role !== "admin") {
    response.status(403).json({ message: "Only admin role can manage catalog." });
    return;
  }

  const productId = getRouteId(request.params.id);
  const payload = parseProductPayload(request.body);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: productInclude,
  });

  if (!product) {
    response.status(404).json({ message: "Product not found." });
    return;
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: payload.name || product.name,
      subtitle: payload.subtitle || product.subtitle,
      priceAmount: payload.priceAmount || product.priceAmount,
      availability: (payload.availability || product.availability) as never,
      description: payload.description || product.description,
      composition: payload.composition || product.composition,
      fittingNotes: payload.fittingNotes || product.fittingNotes,
      deliveryEstimate: payload.deliveryEstimate || product.deliveryEstimate,
      featured: payload.featured,
      style: payload.style.length ? payload.style : product.style,
      categoryId: payload.categoryId || product.categoryId,
      brandName: payload.brandName || product.brandName,
      collectionName: payload.collectionName || product.collectionName,
      dropName: payload.dropName || product.dropName,
      seasonLabel: payload.seasonLabel || product.seasonLabel,
      limitedEdition: payload.limitedEdition,
      limitedQuantity: payload.limitedQuantity ?? product.limitedQuantity,
      colors: payload.colors.length ? payload.colors : product.colors,
      materials: payload.materials.length ? payload.materials : product.materials,
      fitProfile: payload.fitProfile || product.fitProfile,
      careInstructions: payload.careInstructions || product.careInstructions,
      sizeGuide: payload.sizeGuide || product.sizeGuide,
      editorialStory: payload.editorialStory || product.editorialStory,
      relatedProductIds: payload.relatedProductIds.length ? payload.relatedProductIds : product.relatedProductIds,
      crossSellProductIds: payload.crossSellProductIds.length ? payload.crossSellProductIds : product.crossSellProductIds,
    },
  });

  if (payload.coverUrl || payload.galleryUrls.length || payload.sizeLabels.length) {
    await prisma.productMedia.deleteMany({
      where: { productId },
    });

    await prisma.productVariant.deleteMany({
      where: { productId },
    });

    await prisma.productMedia.createMany({
      data: buildMediaRows(
        payload.name || product.name,
        payload.coverUrl || product.media[0]?.url || "",
        payload.galleryUrls.length ? payload.galleryUrls : product.media.slice(1).map((item) => item.url),
        productId,
      ) as Prisma.ProductMediaCreateManyInput[],
    });

    await prisma.productVariant.createMany({
      data: (payload.sizeLabels.length ? payload.sizeLabels : product.variants.map((item) => item.sizeLabel)).map(
        (sizeLabel) => ({
          id: `pv-${randomUUID()}`,
          productId,
          sizeLabel,
          colorLabel: (payload.colors.length ? payload.colors : product.colors)[0] ?? null,
          stock: payload.defaultStock,
        }),
      ),
    });
  }

  const hydratedProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: productInclude,
  });

  response.json({ product: serializeProduct(hydratedProduct!) });
});

app.delete("/api/core/v1/admin/products/:id", authMiddleware, async (request, response) => {
  if (request.user.role !== "admin") {
    response.status(403).json({ message: "Only admin role can manage catalog." });
    return;
  }

  const productId = getRouteId(request.params.id);
  const orderCount = await prisma.order.count({
    where: { productId },
  });

  if (orderCount > 0) {
    response.status(409).json({ message: "Cannot delete product with existing orders." });
    return;
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  response.status(204).send();
});

app.post("/api/core/v1/admin/content", authMiddleware, async (request, response) => {
  if (request.user.role !== "admin") {
    response.status(403).json({ message: "Only admin role can manage content." });
    return;
  }

  const payload = parseContentPayload(request.body);

  if (!payload.slug || !payload.title || !payload.coverUrl) {
    response.status(400).json({ message: "Content payload is incomplete." });
    return;
  }

  const created = await prisma.contentEntry.create({
    data: {
      id: `content-${randomUUID()}`,
      ...payload,
      kind: payload.kind as ContentKind,
      locale: normalizeLocale(payload.locale),
    },
  });

  response.status(201).json({ contentEntry: serializeContentEntry(created) });
});

app.patch("/api/core/v1/admin/content/:id", authMiddleware, async (request, response) => {
  if (request.user.role !== "admin") {
    response.status(403).json({ message: "Only admin role can manage content." });
    return;
  }

  const contentId = getRouteId(request.params.id);
  const payload = parseContentPayload(request.body);

  const existing = await prisma.contentEntry.findUnique({
    where: { id: contentId },
  });

  if (!existing) {
    response.status(404).json({ message: "Content entry not found." });
    return;
  }

  const updated = await prisma.contentEntry.update({
    where: { id: contentId },
    data: {
      kind: payload.kind ? (payload.kind as ContentKind) : existing.kind,
      slug: payload.slug || existing.slug,
      locale: payload.locale ? normalizeLocale(payload.locale) : existing.locale,
      title: payload.title || existing.title,
      summary: payload.summary || existing.summary,
      body: payload.body || existing.body,
      coverUrl: payload.coverUrl || existing.coverUrl,
      eyebrow: payload.eyebrow || existing.eyebrow,
      featured: payload.featured,
    },
  });

  response.json({ contentEntry: serializeContentEntry(updated) });
});

app.delete("/api/core/v1/admin/content/:id", authMiddleware, async (request, response) => {
  if (request.user.role !== "admin") {
    response.status(403).json({ message: "Only admin role can manage content." });
    return;
  }

  const contentId = getRouteId(request.params.id);

  await prisma.contentEntry.delete({
    where: { id: contentId },
  });

  response.status(204).send();
});

io.use(async (socket, next) => {
  try {
    const token = String(socket.handshake.auth?.token ?? "");

    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    const session = await resolveSession(token);

    if (!session) {
      next(new Error("Unauthorized"));
      return;
    }

    socket.data.user = serializeUser(session.user);
    socket.data.token = token;
    next();
  } catch (error) {
    next(error as Error);
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user as User;

  void Promise.all([listOrdersForUser(user), listNotificationsForUser(user)]).then(([orders, notifications]) => {
    socket.emit("orders:sync", orders);
    socket.emit("notifications:sync", notifications);
  });
});

void prisma.$connect().then(() => {
  httpServer.listen(port, () => {
    console.log(`AVISHU core API listening on http://localhost:${port}`);
  });
});

httpServer.on("error", (error) => {
  if ((error as NodeJS.ErrnoException).code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Most likely the core API is already running in another terminal.`,
    );
    console.error(
      `Stop the existing process or change PORT in server/core-api/.env and EXPO_PUBLIC_CORE_API_URL in root .env.`,
    );
    process.exit(1);
  }

  throw error;
});

const productInclude = {
  category: true,
  media: {
    orderBy: { sortOrder: "asc" },
  },
  variants: {
    orderBy: { sizeLabel: "asc" },
  },
} satisfies Prisma.ProductInclude;

const orderInclude = {
  product: {
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
      },
    },
  },
  variant: true,
  customer: true,
  comments: {
    include: {
      author: true,
    },
    orderBy: { createdAt: "asc" },
  },
  attachments: {
    include: {
      author: true,
    },
    orderBy: { createdAt: "asc" },
  },
  auditLogs: {
    orderBy: { createdAt: "asc" },
  },
  tags: {
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.OrderInclude;

async function authMiddleware(
  request: Request & { user?: User; token?: string },
  response: Response,
  next: NextFunction,
) {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = header.replace("Bearer ", "");
  const session = await resolveSession(token);

  if (!session) {
    response.status(401).json({ message: "Invalid session" });
    return;
  }

  request.user = serializeUser(session.user);
  request.token = token;
  next();
}

async function resolveSession(token: string) {
  return prisma.session.findFirst({
    where: {
      token,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });
}

async function createSession(userId: string) {
  const token = randomUUID();

  await prisma.session.create({
    data: {
      id: `s-${randomUUID()}`,
      token,
      userId,
      expiresAt: addDays(new Date(), SESSION_DAYS),
    },
  });

  return token;
}

async function buildBootstrap(user: User): Promise<BootstrapPayload> {
  const [
    customers,
    categories,
    products,
    orders,
    tryOnSessions,
    favorites,
    productViews,
    savedAddresses,
    savedCards,
    notifications,
    rewards,
    recommendations,
    contentEntries,
    metrics,
    funnel,
  ] = await Promise.all([
    listCustomersForUser(user),
    listCategories(),
    listProducts(),
    listOrdersForUser(user),
    listTryOnsForUser(user),
    listFavoritesForUser(user),
    listProductViewsForUser(user),
    listSavedAddressesForUser(user),
    listSavedCardsForUser(user),
    listNotificationsForUser(user),
    listRewards(),
    listRecommendationsForUser(user),
    listContentEntries(),
    buildMetrics(),
    buildFunnel(),
  ]);

  return {
    user,
    customers,
    categories,
    products,
    orders,
    tryOnSessions,
    favorites,
    productViews,
    savedAddresses,
    savedCards,
    notifications,
    rewards,
    recommendations,
    contentEntries,
    metrics,
    funnel,
  };
}

async function listCustomersForUser(user: User): Promise<User[]> {
  if (user.role === "client") {
    return [];
  }

  const customers = await prisma.user.findMany({
    where: { role: "client" },
    orderBy: { createdAt: "desc" },
  });

  return customers.map(serializeUser);
}

async function listCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
  }));
}

async function listProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    include: productInclude,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return products.map(serializeProduct);
}

async function listTryOnsForUser(user: User): Promise<TryOnSession[]> {
  const tryOns = await prisma.tryOnSession.findMany({
    where: user.role === "client" ? { userId: user.id } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return tryOns.map(serializeTryOn);
}

async function listOrdersForUser(user: User): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: user.role === "client" ? { customerId: user.id } : undefined,
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return orders.map(serializeOrder);
}

async function listFavoritesForUser(user: User): Promise<Favorite[]> {
  if (user.role !== "client") {
    return [];
  }

  const favorites = await prisma.productFavorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return favorites.map(serializeFavorite);
}

async function listProductViewsForUser(user: User): Promise<ProductView[]> {
  if (user.role !== "client") {
    return [];
  }

  const productViews = await prisma.productView.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return productViews.map(serializeProductView);
}

async function listSavedAddressesForUser(user: User): Promise<SavedAddress[]> {
  if (user.role !== "client") {
    return [];
  }

  const addresses = await prisma.savedAddress.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return addresses.map(serializeSavedAddress);
}

async function listSavedCardsForUser(user: User): Promise<SavedPaymentCard[]> {
  if (user.role !== "client") {
    return [];
  }

  const cards = await prisma.savedPaymentCard.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return cards.map(serializeSavedCard);
}

async function listNotificationsForUser(user: User): Promise<Notification[]> {
  const notifications = await prisma.notification.findMany({
    where: {
      OR: [{ userId: user.id }, { roleTarget: user.role as PrismaRole }],
    },
    orderBy: { createdAt: "desc" },
  });

  return notifications.map(serializeNotification);
}

async function listRewards(): Promise<Reward[]> {
  const rewards = await prisma.reward.findMany({
    where: { active: true },
    orderBy: [{ pointsRequired: "asc" }, { createdAt: "asc" }],
  });

  return rewards.map(serializeReward);
}

async function listRecommendationsForUser(user: User): Promise<Recommendation[]> {
  if (user.role !== "client") {
    return [];
  }

  const recommendations = await prisma.recommendation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return recommendations.map(serializeRecommendation);
}

async function listContentEntries(locale?: AppLanguage): Promise<ContentEntryVm[]> {
  const contentEntries = await prisma.contentEntry.findMany({
    where: locale ? { locale } : undefined,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });

  return contentEntries.map(serializeContentEntry);
}

async function buildMetrics(): Promise<DashboardMetrics> {
  const [products, orders, favorites, contentEntries, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.productFavorite.count(),
    prisma.contentEntry.count(),
    prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        paymentStatus: "paid",
      },
    }),
  ]);

  const readyOrders = await prisma.order.count({
    where: { status: "ready" },
  });

  return {
    revenue: formatMoney(revenue._sum.totalAmount ?? 0),
    plan: `${Math.min(100, readyOrders * 14)}%`,
    products,
    orders,
    readyOrders,
    favoriteCount: favorites,
    contentEntries,
  };
}

async function buildFunnel(): Promise<FunnelMetrics> {
  const [productViews, favorites, orders, paidOrders, distinctViewedProducts] = await Promise.all([
    prisma.productView.count(),
    prisma.productFavorite.count(),
    prisma.order.count(),
    prisma.order.count({
      where: { paymentStatus: "paid" },
    }),
    prisma.productView.findMany({
      distinct: ["productId"],
      select: { productId: true },
    }),
  ]);

  return {
    productViews,
    productCards: distinctViewedProducts.length,
    cartAdds: favorites + orders,
    checkouts: orders,
    paidOrders,
    abandonedCarts: Math.max(productViews - paidOrders, 0),
  };
}

async function updateOrderWorkflowInternal({
  actor,
  orderId,
  payload,
}: {
  actor: User;
  orderId: string;
  payload: {
    status?: OrderStatus;
    priority?: PriorityLevelVm;
    slaHours?: number;
    returnRequested?: boolean;
    exchangeRequested?: boolean;
    cancellationRequested?: boolean;
    qcChecklist?: string;
    tags?: string[];
    notifyClient?: boolean;
  };
}) {
  if (actor.role === "client" || actor.role === "admin") {
    throw new Error("This role cannot update operational workflow.");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (payload.status && !canTransitionOrder(actor.role, order.status as OrderStatus, payload.status)) {
    throw new Error("This role cannot move the order to that status.");
  }

  const status = payload.status ?? (order.status as OrderStatus);
  const slaHours = payload.slaHours ?? order.slaHours;
  const dueAt =
    payload.slaHours !== undefined
      ? addHours(new Date(order.createdAt), payload.slaHours)
      : order.dueAt ?? addHours(new Date(order.createdAt), order.slaHours);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      priority: (payload.priority ?? order.priority) as PriorityLevel,
      slaHours,
      dueAt,
      returnRequested: payload.returnRequested ?? order.returnRequested,
      exchangeRequested: payload.exchangeRequested ?? order.exchangeRequested,
      cancellationRequested: payload.cancellationRequested ?? order.cancellationRequested,
      qcChecklist: payload.qcChecklist ?? order.qcChecklist,
    },
  });

  if (payload.tags) {
    await prisma.orderTag.deleteMany({
      where: { orderId },
    });

    if (payload.tags.length) {
      await prisma.orderTag.createMany({
        data: payload.tags.map((label) => ({
          id: `tag-${randomUUID()}`,
          orderId,
          label,
        })),
      });
    }
  }

  const auditMessage = buildWorkflowAuditMessage(actor.role, payload, order.status as OrderStatus, status);

  await prisma.orderAuditLog.create({
    data: {
      id: `audit-${randomUUID()}`,
      orderId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role as PrismaRole,
      action: payload.status ? "status_changed" : "workflow_updated",
      message: auditMessage,
    },
  });

  await fanOutWorkflowNotifications(actor, order.customerId, order.id, order.number, payload, status);

  await emitRealtimeSnapshots();

  const hydrated = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  return serializeOrder(hydrated!);
}

function buildWorkflowAuditMessage(
  actorRole: Role,
  payload: {
    status?: OrderStatus;
    priority?: PriorityLevelVm;
    slaHours?: number;
    returnRequested?: boolean;
    exchangeRequested?: boolean;
    cancellationRequested?: boolean;
    qcChecklist?: string;
    tags?: string[];
    notifyClient?: boolean;
  },
  previousStatus: OrderStatus,
  nextStatus: OrderStatus,
) {
  if (payload.status && previousStatus !== nextStatus) {
    return `${actorRole} moved the order from ${previousStatus} to ${nextStatus}.`;
  }

  const fragments: string[] = [];

  if (payload.priority) {
    fragments.push(`priority -> ${payload.priority}`);
  }

  if (payload.slaHours !== undefined) {
    fragments.push(`sla -> ${payload.slaHours}h`);
  }

  if (payload.returnRequested !== undefined) {
    fragments.push(`return requested -> ${payload.returnRequested ? "yes" : "no"}`);
  }

  if (payload.exchangeRequested !== undefined) {
    fragments.push(`exchange requested -> ${payload.exchangeRequested ? "yes" : "no"}`);
  }

  if (payload.cancellationRequested !== undefined) {
    fragments.push(`cancellation requested -> ${payload.cancellationRequested ? "yes" : "no"}`);
  }

  if (payload.qcChecklist !== undefined) {
    fragments.push("qc checklist updated");
  }

  if (payload.tags) {
    fragments.push(`tags -> ${payload.tags.join(", ") || "cleared"}`);
  }

  return fragments.length
    ? `${actorRole} updated workflow: ${fragments.join("; ")}.`
    : `${actorRole} updated workflow details.`;
}

async function fanOutWorkflowNotifications(
  actor: User,
  customerId: string,
  orderId: string,
  orderNumber: string,
  payload: {
    status?: OrderStatus;
    priority?: PriorityLevelVm;
    slaHours?: number;
    returnRequested?: boolean;
    exchangeRequested?: boolean;
    cancellationRequested?: boolean;
    qcChecklist?: string;
    tags?: string[];
    notifyClient?: boolean;
  },
  status: OrderStatus,
) {
  if (payload.notifyClient || payload.status || payload.returnRequested || payload.exchangeRequested) {
    const titleByStatus: Record<OrderStatus, string> = {
      pending_franchisee: "Order is waiting for intake",
      in_production: "Order entered production",
      quality_check: "Order is in quality check",
      ready: "Order is ready",
      delivered: "Order delivered",
      cancelled: "Order cancelled",
      return_requested: "Return requested",
      exchange_requested: "Exchange requested",
    };

    await createNotificationForUser(
      customerId,
      "order_status",
      orderId,
      titleByStatus[status],
      `${orderNumber} status: ${status}.`,
    );
  }

  if (payload.status) {
    if (status === "pending_franchisee") {
      await createNotificationForRole(
        "franchisee",
        "staff_action",
        orderId,
        "Order requires intake",
        `${orderNumber} is waiting for franchisee review.`,
      );
    }

    if (status === "in_production" || status === "quality_check") {
      await createNotificationForRole(
        "production",
        "staff_action",
        orderId,
        "Production workflow updated",
        `${orderNumber} moved to ${status}.`,
      );
    }

    if (status === "ready" || status === "delivered") {
      await createNotificationForRole(
        "support",
        "staff_action",
        orderId,
        "Client communication required",
        `${orderNumber} moved to ${status}.`,
      );
    }
  }

  if (payload.returnRequested || payload.exchangeRequested || payload.cancellationRequested) {
    await createNotificationForRole(
      "support",
      "order_action",
      orderId,
      "Client service action requested",
      `${actor.name} flagged ${orderNumber} for ${
        payload.returnRequested
          ? "return"
          : payload.exchangeRequested
            ? "exchange"
            : "cancellation"
      }.`,
    );
  }
}

async function createNotificationForUser(
  userId: string,
  type: NotificationType,
  orderId: string | null,
  title: string,
  body: string,
) {
  return prisma.notification.create({
    data: {
      id: `note-${randomUUID()}`,
      userId,
      orderId,
      type,
      title,
      body,
    },
  });
}

async function createNotificationForRole(
  roleTarget: Role,
  type: NotificationType,
  orderId: string | null,
  title: string,
  body: string,
) {
  return prisma.notification.create({
    data: {
      id: `note-${randomUUID()}`,
      roleTarget: roleTarget as PrismaRole,
      orderId,
      type,
      title,
      body,
    },
  });
}

async function getSerializedUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return serializeUser(user);
}

async function syncUserDefaults(userId: string) {
  const [address, card] = await Promise.all([
    prisma.savedAddress.findFirst({
      where: { userId, isDefault: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.savedPaymentCard.findFirst({
      where: { userId, isDefault: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  await prisma.user.update({
    where: { id: userId },
    data: {
      defaultShippingAddress: address ? formatAddressLine(address) : null,
      paymentCardBrand: card?.brand ?? null,
      paymentCardLast4: card?.last4 ?? null,
      paymentCardHolder: card?.holderName ?? null,
    },
  });
}

async function ensureAddressDefault(userId: string) {
  const defaultCount = await prisma.savedAddress.count({
    where: { userId, isDefault: true },
  });

  if (defaultCount > 0) {
    return;
  }

  const first = await prisma.savedAddress.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (!first) {
    return;
  }

  await prisma.savedAddress.update({
    where: { id: first.id },
    data: { isDefault: true },
  });
}

async function ensureCardDefault(userId: string) {
  const defaultCount = await prisma.savedPaymentCard.count({
    where: { userId, isDefault: true },
  });

  if (defaultCount > 0) {
    return;
  }

  const first = await prisma.savedPaymentCard.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (!first) {
    return;
  }

  await prisma.savedPaymentCard.update({
    where: { id: first.id },
    data: { isDefault: true },
  });
}

function serializeUser(
  user: Prisma.UserGetPayload<Record<string, never>>,
): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    avatarUrl: user.avatarUrl ?? undefined,
    phone: user.phone ?? undefined,
    defaultShippingAddress: user.defaultShippingAddress ?? undefined,
    paymentCardBrand: user.paymentCardBrand ?? undefined,
    paymentCardLast4: user.paymentCardLast4 ?? undefined,
    paymentCardHolder: user.paymentCardHolder ?? undefined,
    loyaltyProgress: user.loyaltyProgress,
    loyaltyPoints: user.loyaltyPoints,
    loyaltyTier: user.loyaltyTier as LoyaltyTier,
    segment: user.segment,
  };
}

function serializeSavedAddress(
  address: Prisma.SavedAddressGetPayload<Record<string, never>>,
): SavedAddress {
  return {
    id: address.id,
    label: address.label,
    city: address.city,
    line1: address.line1,
    line2: address.line2 ?? undefined,
    isDefault: address.isDefault,
  };
}

function serializeSavedCard(
  card: Prisma.SavedPaymentCardGetPayload<Record<string, never>>,
): SavedPaymentCard {
  return {
    id: card.id,
    brand: card.brand,
    holderName: card.holderName,
    last4: card.last4,
    isDefault: card.isDefault,
  };
}

function serializeProduct(
  product: Prisma.ProductGetPayload<{ include: typeof productInclude }>,
): Product {
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    subtitle: product.subtitle,
    priceAmount: product.priceAmount,
    currency: product.currency,
    formattedPrice: formatMoney(product.priceAmount, product.currency),
    availability: product.availability as ProductAvailability,
    style: product.style,
    description: product.description,
    composition: product.composition,
    fittingNotes: product.fittingNotes,
    deliveryEstimate: product.deliveryEstimate,
    featured: product.featured,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    brandName: product.brandName,
    collectionName: product.collectionName,
    dropName: product.dropName,
    seasonLabel: product.seasonLabel,
    limitedEdition: product.limitedEdition,
    limitedQuantity: product.limitedQuantity ?? undefined,
    colors: product.colors,
    materials: product.materials,
    fitProfile: product.fitProfile,
    careInstructions: product.careInstructions,
    sizeGuide: product.sizeGuide,
    editorialStory: product.editorialStory,
    relatedProductIds: product.relatedProductIds,
    crossSellProductIds: product.crossSellProductIds,
    media: product.media.map((item) => ({
      id: item.id,
      url: item.url,
      alt: item.alt,
      kind: item.kind,
      sortOrder: item.sortOrder,
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sizeLabel: variant.sizeLabel,
      colorLabel: variant.colorLabel ?? undefined,
      stock: variant.stock,
      reserved: variant.reserved,
    })),
  };
}

function serializeFavorite(
  favorite: Prisma.ProductFavoriteGetPayload<Record<string, never>>,
): Favorite {
  return {
    id: favorite.id,
    productId: favorite.productId,
    createdAt: favorite.createdAt.toISOString(),
  };
}

function serializeProductView(
  productView: Prisma.ProductViewGetPayload<Record<string, never>>,
): ProductView {
  return {
    id: productView.id,
    productId: productView.productId,
    createdAt: productView.createdAt.toISOString(),
  };
}

function serializeTryOn(
  tryOn: Prisma.TryOnSessionGetPayload<Record<string, never>>,
): TryOnSession {
  return {
    id: tryOn.id,
    userId: tryOn.userId,
    productId: tryOn.productId,
    sourceImageUrl: tryOn.sourceImageUrl,
    resultImageUrl: tryOn.resultImageUrl ?? undefined,
    status: tryOn.status,
    notes: tryOn.notes,
    createdAt: tryOn.createdAt.toISOString(),
  };
}

function serializeOrder(
  order: Prisma.OrderGetPayload<{ include: typeof orderInclude }>,
): Order {
  return {
    id: order.id,
    number: order.number,
    productId: order.productId,
    productName: order.product.name,
    productSku: order.product.sku,
    productMediaUrl: order.product.media[0]?.url ?? undefined,
    variantId: order.variantId ?? undefined,
    sizeLabel: order.variant?.sizeLabel ?? undefined,
    customerId: order.customerId,
    customerName: order.customer.name,
    status: order.status as OrderStatus,
    paymentStatus: order.paymentStatus,
    deliveryMethod: order.deliveryMethod,
    paymentMethod: order.paymentMethod,
    priority: order.priority as PriorityLevelVm,
    notes: order.notes,
    shippingAddress: order.shippingAddress,
    contactPhone: order.contactPhone,
    scheduledDate: order.scheduledDate?.toISOString(),
    dueAt: order.dueAt?.toISOString(),
    tryOnId: order.tryOnId ?? undefined,
    totalAmount: order.totalAmount,
    totalFormatted: formatMoney(order.totalAmount, order.currency),
    slaHours: order.slaHours,
    returnRequested: order.returnRequested,
    exchangeRequested: order.exchangeRequested,
    cancellationRequested: order.cancellationRequested,
    qcChecklist: order.qcChecklist ?? undefined,
    internalTags: order.tags.map((tag) => tag.label),
    createdAt: order.createdAt.toISOString(),
    comments: order.comments.map((comment) => ({
      id: comment.id,
      message: comment.message,
      authorId: comment.authorId,
      authorName: comment.author.name,
      authorRole: comment.author.role as Role,
      createdAt: comment.createdAt.toISOString(),
    })),
    attachments: order.attachments.map((attachment) => ({
      id: attachment.id,
      label: attachment.label,
      url: attachment.url,
      authorId: attachment.authorId,
      authorName: attachment.author.name,
      createdAt: attachment.createdAt.toISOString(),
    })),
    auditLogs: order.auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      message: log.message,
      actorId: log.actorId ?? undefined,
      actorName: log.actorName,
      actorRole: log.actorRole as Role,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}

function serializeNotification(
  notification: Prisma.NotificationGetPayload<Record<string, never>>,
): Notification {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    createdAt: notification.createdAt.toISOString(),
    read: Boolean(notification.readAt),
    orderId: notification.orderId ?? undefined,
    roleTarget: notification.roleTarget as Role | undefined,
  };
}

function serializeReward(
  reward: Prisma.RewardGetPayload<Record<string, never>>,
): Reward {
  return {
    id: reward.id,
    title: reward.title,
    description: reward.description,
    pointsRequired: reward.pointsRequired,
    tier: reward.tier as LoyaltyTier,
    active: reward.active,
  };
}

function serializeRecommendation(
  recommendation: Prisma.RecommendationGetPayload<Record<string, never>>,
): Recommendation {
  return {
    id: recommendation.id,
    productId: recommendation.productId,
    label: recommendation.label,
    reason: recommendation.reason,
  };
}

function serializeContentEntry(
  entry: Prisma.ContentEntryGetPayload<Record<string, never>>,
): ContentEntryVm {
  return {
    id: entry.id,
    kind: entry.kind,
    slug: entry.slug,
    locale: normalizeLocale(entry.locale),
    title: entry.title,
    summary: entry.summary,
    body: entry.body,
    coverUrl: entry.coverUrl,
    eyebrow: entry.eyebrow,
    featured: entry.featured,
    publishedAt: entry.publishedAt.toISOString(),
  };
}

function hashPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function addDays(date: Date, amount: number) {
  return new Date(date.getTime() + amount * 24 * 60 * 60 * 1000);
}

function addHours(date: Date, amount: number) {
  return new Date(date.getTime() + amount * 60 * 60 * 1000);
}

function formatMoney(amount: number, currency = "KZT") {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("₸", "KZT");
}

function buildDefaultOrderNote(availability: ProductAvailability, scheduledDate?: string) {
  if (availability === "preorder") {
    return scheduledDate
      ? `Preorder reserved for ${scheduledDate}.`
      : "Preorder item reserved for production scheduling.";
  }

  return scheduledDate ? `Ready-to-ship item reserved for ${scheduledDate}.` : "Client confirmed standard order.";
}

function canTransitionOrder(role: Role, current: OrderStatus, next: OrderStatus) {
  const allowedByRole: Record<Role, OrderStatus[]> = {
    client: [],
    admin: [],
    franchisee: ["pending_franchisee", "in_production", "cancelled"],
    production: ["in_production", "quality_check", "ready"],
    support: ["quality_check", "ready", "delivered", "cancelled", "return_requested", "exchange_requested"],
  };

  if (!allowedByRole[role].includes(next)) {
    return false;
  }

  const workflow: Record<OrderStatus, OrderStatus[]> = {
    pending_franchisee: ["in_production", "cancelled"],
    in_production: ["quality_check", "cancelled"],
    quality_check: ["ready", "exchange_requested", "return_requested"],
    ready: ["delivered", "return_requested", "exchange_requested"],
    delivered: ["return_requested", "exchange_requested"],
    cancelled: [],
    return_requested: ["cancelled", "delivered"],
    exchange_requested: ["in_production", "ready"],
  };

  return current === next || workflow[current].includes(next);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0400-\u04ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getRouteId(value: string | string[] | undefined) {
  return Array.isArray(value) ? String(value[0] ?? "").trim() : String(value ?? "").trim();
}

function normalizeLocale(value: string): AppLanguage {
  if (value === "kk" || value === "en") {
    return value;
  }

  return "ru";
}

function parseAddressPayload(body: unknown) {
  const data = (body ?? {}) as Record<string, unknown>;

  return {
    label: String(data.label ?? "").trim(),
    city: String(data.city ?? "").trim(),
    line1: String(data.line1 ?? "").trim(),
    line2: String(data.line2 ?? "").trim() || null,
    isDefault: Boolean(data.isDefault),
  };
}

function parseCardPayload(body: unknown) {
  const data = (body ?? {}) as Record<string, unknown>;

  return {
    brand: String(data.brand ?? "").trim(),
    holderName: String(data.holderName ?? "").trim(),
    last4: String(data.last4 ?? "").replace(/\D/g, "").slice(-4),
    isDefault: Boolean(data.isDefault),
  };
}

function parseWorkflowPayload(body: unknown) {
  const data = (body ?? {}) as Record<string, unknown>;

  return {
    status: data.status ? (String(data.status).trim() as OrderStatus) : undefined,
    priority: data.priority ? (String(data.priority).trim() as PriorityLevelVm) : undefined,
    slaHours: Number.isFinite(Number(data.slaHours)) ? Number(data.slaHours) : undefined,
    returnRequested:
      typeof data.returnRequested === "boolean" ? data.returnRequested : undefined,
    exchangeRequested:
      typeof data.exchangeRequested === "boolean" ? data.exchangeRequested : undefined,
    cancellationRequested:
      typeof data.cancellationRequested === "boolean" ? data.cancellationRequested : undefined,
    qcChecklist: data.qcChecklist !== undefined ? String(data.qcChecklist).trim() : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map((item) => String(item).trim()).filter(Boolean) : undefined,
    notifyClient: typeof data.notifyClient === "boolean" ? data.notifyClient : undefined,
  };
}

function parseProductPayload(body: unknown) {
  const data = (body ?? {}) as Record<string, unknown>;

  return {
    name: String(data.name ?? "").trim(),
    subtitle: String(data.subtitle ?? "").trim(),
    categoryId: String(data.categoryId ?? "").trim(),
    priceAmount: Number.isFinite(Number(data.priceAmount)) ? Number(data.priceAmount) : 0,
    availability: String(data.availability ?? "in_stock").trim() as ProductAvailability,
    description: String(data.description ?? "").trim(),
    composition: String(data.composition ?? "").trim(),
    fittingNotes: String(data.fittingNotes ?? "").trim(),
    deliveryEstimate: String(data.deliveryEstimate ?? "").trim(),
    featured: Boolean(data.featured),
    coverUrl: String(data.coverUrl ?? "").trim(),
    galleryUrls: Array.isArray(data.galleryUrls)
      ? data.galleryUrls.map((item) => String(item).trim()).filter(Boolean)
      : [],
    sizeLabels: Array.isArray(data.sizeLabels)
      ? data.sizeLabels.map((item) => String(item).trim()).filter(Boolean)
      : [],
    style: Array.isArray(data.style) ? data.style.map((item) => String(item).trim()).filter(Boolean) : [],
    defaultStock: Number.isFinite(Number(data.defaultStock)) ? Number(data.defaultStock) : 0,
    brandName: String(data.brandName ?? "").trim(),
    collectionName: String(data.collectionName ?? "").trim(),
    dropName: String(data.dropName ?? "").trim(),
    seasonLabel: String(data.seasonLabel ?? "").trim(),
    limitedEdition: Boolean(data.limitedEdition),
    limitedQuantity: Number.isFinite(Number(data.limitedQuantity)) ? Number(data.limitedQuantity) : undefined,
    colors: Array.isArray(data.colors) ? data.colors.map((item) => String(item).trim()).filter(Boolean) : [],
    materials: Array.isArray(data.materials)
      ? data.materials.map((item) => String(item).trim()).filter(Boolean)
      : [],
    fitProfile: String(data.fitProfile ?? "").trim(),
    careInstructions: String(data.careInstructions ?? "").trim(),
    sizeGuide: String(data.sizeGuide ?? "").trim(),
    editorialStory: String(data.editorialStory ?? "").trim(),
    relatedProductIds: Array.isArray(data.relatedProductIds)
      ? data.relatedProductIds.map((item) => String(item).trim()).filter(Boolean)
      : [],
    crossSellProductIds: Array.isArray(data.crossSellProductIds)
      ? data.crossSellProductIds.map((item) => String(item).trim()).filter(Boolean)
      : [],
  };
}

function parseContentPayload(body: unknown) {
  const data = (body ?? {}) as Record<string, unknown>;

  return {
    kind: String(data.kind ?? "journal").trim(),
    slug: String(data.slug ?? "").trim(),
    locale: String(data.locale ?? "ru").trim(),
    title: String(data.title ?? "").trim(),
    summary: String(data.summary ?? "").trim(),
    body: String(data.body ?? "").trim(),
    coverUrl: String(data.coverUrl ?? "").trim(),
    eyebrow: String(data.eyebrow ?? "").trim(),
    featured: Boolean(data.featured),
    publishedAt: addDays(new Date(), 0),
  };
}

function buildMediaRows(
  name: string,
  coverUrl: string,
  galleryUrls: string[],
  productId?: string,
): Array<{
  id: string;
  url: string;
  alt: string;
  kind: MediaKind;
  sortOrder: number;
  productId?: string;
}> {
  const rows = [
    {
      id: `pm-${randomUUID()}`,
      ...(productId ? { productId } : {}),
      url: coverUrl,
      alt: `${name} cover`,
      kind: "cover" as MediaKind,
      sortOrder: 0,
    },
    ...galleryUrls.map((url, index) => ({
      id: `pm-${randomUUID()}`,
      ...(productId ? { productId } : {}),
      url,
      alt: `${name} gallery ${index + 1}`,
      kind: (index === 0 ? "detail" : "gallery") as MediaKind,
      sortOrder: index + 1,
    })),
  ];

  return rows.filter((item) => item.url);
}

function formatAddressLine(address: {
  label: string;
  city: string;
  line1: string;
  line2?: string | null;
}) {
  return [address.label, address.city, address.line1, address.line2].filter(Boolean).join(", ");
}

async function emitRealtimeSnapshots() {
  const sockets = await io.fetchSockets();

  await Promise.all(
    sockets.map(async (socket) => {
      const user = socket.data.user as User | undefined;

      if (!user) {
        return;
      }

      const [orders, notifications] = await Promise.all([
        listOrdersForUser(user),
        listNotificationsForUser(user),
      ]);

      socket.emit("orders:sync", orders);
      socket.emit("notifications:sync", notifications);
    }),
  );
}

declare global {
  namespace Express {
    interface Request {
      user: User;
      token?: string;
    }
  }
}
