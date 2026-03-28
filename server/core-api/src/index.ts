import "dotenv/config";

import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:http";

import { MediaKind, Prisma, Role as PrismaRole } from "@prisma/client";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";

import { prisma } from "./prisma.js";
import {
  Category,
  DeliveryMethod,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductAvailability,
  Role,
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
  const [users, products, orders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);

  response.json({ ok: true, users, products, orders });
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
      loyaltyProgress: 0,
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

app.get("/api/core/v1/bootstrap", authMiddleware, async (request, response) => {
  response.json(await buildBootstrap(request.user));
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
  const paymentMethod = String(request.body?.paymentMethod ?? "") as PaymentMethod;
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
      paymentMethod,
      notes: notes || buildDefaultOrderNote(product.availability, scheduledDate),
      shippingAddress,
      contactPhone,
      scheduledDate: scheduledDate ? new Date(`${scheduledDate}T00:00:00.000Z`) : null,
      totalAmount: product.priceAmount,
      currency: product.currency,
    },
    include: orderInclude,
  });

  await emitOrdersSnapshot();
  response.status(201).json({ order: serializeOrder(createdOrder) });
});

app.patch("/api/core/v1/orders/:id/status", authMiddleware, async (request, response) => {
  if (request.user.role === "client") {
    response.status(403).json({ message: "Client cannot update order status." });
    return;
  }

  const orderId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const nextStatus = String(request.body?.status ?? "") as OrderStatus;

  if (!nextStatus) {
    response.status(400).json({ message: "status is required." });
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    response.status(404).json({ message: "Order not found." });
    return;
  }

  if (!canTransitionOrder(request.user.role, order.status as OrderStatus, nextStatus)) {
    response.status(403).json({ message: "This role cannot move the order to that status." });
    return;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: nextStatus,
    },
    include: orderInclude,
  });

  await emitOrdersSnapshot();
  response.json({ order: serializeOrder(updatedOrder) });
});

app.post("/api/core/v1/orders/:id/comments", authMiddleware, async (request, response) => {
  const orderId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
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

  const updatedOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  await emitOrdersSnapshot();
  response.status(201).json({ order: serializeOrder(updatedOrder!) });
});

app.post("/api/core/v1/orders/:id/attachments", authMiddleware, async (request, response) => {
  if (request.user.role === "client") {
    response.status(403).json({ message: "Client cannot add attachments." });
    return;
  }

  const orderId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
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

  const updatedOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  await emitOrdersSnapshot();
  response.status(201).json({ order: serializeOrder(updatedOrder!) });
});

app.post("/api/core/v1/admin/products", authMiddleware, async (request, response) => {
  if (request.user.role !== "franchisee") {
    response.status(403).json({ message: "Only franchisee role can manage catalog." });
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
      availability: payload.availability,
      style: payload.style,
      description: payload.description,
      composition: payload.composition,
      fittingNotes: payload.fittingNotes,
      deliveryEstimate: payload.deliveryEstimate,
      featured: payload.featured,
      categoryId: payload.categoryId,
      media: {
        create: [
          {
            id: `pm-${randomUUID()}`,
            url: payload.coverUrl,
            alt: `${payload.name} cover`,
            kind: "cover",
            sortOrder: 0,
          },
          ...payload.galleryUrls.map((url, index) => ({
            id: `pm-${randomUUID()}`,
            url,
            alt: `${payload.name} gallery ${index + 1}`,
            kind: "gallery" as const,
            sortOrder: index + 1,
          })),
        ],
      },
      variants: {
        create: payload.sizeLabels.map((sizeLabel) => ({
          id: `pv-${randomUUID()}`,
          sizeLabel,
          stock: payload.defaultStock,
        })),
      },
    },
    include: productInclude,
  });

  response.status(201).json({ product: serializeProduct(createdProduct) });
});

app.patch("/api/core/v1/admin/products/:id", authMiddleware, async (request, response) => {
  if (request.user.role !== "franchisee") {
    response.status(403).json({ message: "Only franchisee role can manage catalog." });
    return;
  }

  const productId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const payload = parseProductPayload(request.body);

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    response.status(404).json({ message: "Product not found." });
    return;
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      name: payload.name || product.name,
      subtitle: payload.subtitle || product.subtitle,
      priceAmount: payload.priceAmount || product.priceAmount,
      availability: payload.availability || product.availability,
      description: payload.description || product.description,
      composition: payload.composition || product.composition,
      fittingNotes: payload.fittingNotes || product.fittingNotes,
      deliveryEstimate: payload.deliveryEstimate || product.deliveryEstimate,
      featured: payload.featured,
      style: payload.style.length ? payload.style : product.style,
      categoryId: payload.categoryId || product.categoryId,
    },
    include: productInclude,
  });

  if (payload.coverUrl || payload.galleryUrls.length || payload.sizeLabels.length) {
    await prisma.productMedia.deleteMany({
      where: { productId },
    });

    await prisma.productVariant.deleteMany({
      where: { productId },
    });

    const mediaRows: Prisma.ProductMediaCreateManyInput[] = [
      {
        id: `pm-${randomUUID()}`,
        productId,
        url: payload.coverUrl || updatedProduct.media[0]?.url || "",
        alt: `${updatedProduct.name} cover`,
        kind: MediaKind.cover,
        sortOrder: 0,
      },
      ...payload.galleryUrls.map((url, index) => ({
        id: `pm-${randomUUID()}`,
        productId,
        url,
        alt: `${updatedProduct.name} gallery ${index + 1}`,
        kind: MediaKind.gallery,
        sortOrder: index + 1,
      })),
    ].filter((item) => item.url);

    await prisma.productMedia.createMany({
      data: mediaRows,
    });

    await prisma.productVariant.createMany({
      data: (payload.sizeLabels.length ? payload.sizeLabels : updatedProduct.variants.map((item) => item.sizeLabel)).map(
        (sizeLabel) => ({
          id: `pv-${randomUUID()}`,
          productId,
          sizeLabel,
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
  if (request.user.role !== "franchisee") {
    response.status(403).json({ message: "Only franchisee role can manage catalog." });
    return;
  }

  const productId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
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
  void listOrdersForUser(socket.data.user as User).then((orders) => {
    socket.emit("orders:sync", orders);
  });
});

void prisma.$connect().then(() => {
  httpServer.listen(port, () => {
    console.log(`AVISHU core API listening on http://localhost:${port}`);
  });
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

async function buildBootstrap(user: User) {
  const [categories, products, orders, tryOnSessions] = await Promise.all([
    listCategories(),
    listProducts(),
    listOrdersForUser(user),
    listTryOnsForUser(user),
  ]);

  return {
    user,
    categories,
    products,
    orders,
    tryOnSessions,
    metrics: await buildMetrics(),
  };
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
    where:
      user.role === "client"
        ? {
            customerId: user.id,
          }
        : undefined,
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return orders.map(serializeOrder);
}

async function buildMetrics() {
  const [products, orders, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
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
    where: {
      status: "ready",
    },
  });

  return {
    revenue: formatMoney(revenue._sum.totalAmount ?? 0),
    plan: `${Math.min(100, readyOrders * 18)}%`,
    products,
    orders,
    readyOrders,
  };
}

function serializeUser(user: {
  id: string;
  email: string;
  name: string;
  role: PrismaRole;
  avatarUrl: string | null;
  phone: string | null;
  loyaltyProgress: number;
}): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    avatarUrl: user.avatarUrl ?? undefined,
    phone: user.phone ?? undefined,
    loyaltyProgress: user.loyaltyProgress,
  };
}

function serializeProduct(
  product: Prisma.ProductGetPayload<{
    include: typeof productInclude;
  }>,
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
    media: product.media.map((media) => ({
      id: media.id,
      url: media.url,
      alt: media.alt,
      kind: media.kind,
      sortOrder: media.sortOrder,
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sizeLabel: variant.sizeLabel,
      stock: variant.stock,
      reserved: variant.reserved,
    })),
  };
}

function serializeTryOn(tryOn: {
  id: string;
  userId: string;
  productId: string;
  sourceImageUrl: string;
  resultImageUrl: string | null;
  status: string;
  notes: string;
  createdAt: Date;
}): TryOnSession {
  return {
    id: tryOn.id,
    userId: tryOn.userId,
    productId: tryOn.productId,
    sourceImageUrl: tryOn.sourceImageUrl,
    resultImageUrl: tryOn.resultImageUrl ?? undefined,
    status: tryOn.status as TryOnSession["status"],
    notes: tryOn.notes,
    createdAt: tryOn.createdAt.toISOString(),
  };
}

function serializeOrder(
  order: Prisma.OrderGetPayload<{
    include: typeof orderInclude;
  }>,
): Order {
  return {
    id: order.id,
    number: order.number,
    productId: order.productId,
    productName: order.product.name,
    productSku: order.product.sku,
    productMediaUrl: order.product.media[0]?.url,
    variantId: order.variantId ?? undefined,
    sizeLabel: order.variant?.sizeLabel,
    customerId: order.customerId,
    customerName: order.customer.name,
    status: order.status as OrderStatus,
    paymentStatus: order.paymentStatus,
    deliveryMethod: order.deliveryMethod,
    paymentMethod: order.paymentMethod,
    notes: order.notes,
    shippingAddress: order.shippingAddress,
    contactPhone: order.contactPhone,
    scheduledDate: order.scheduledDate?.toISOString().slice(0, 10),
    tryOnId: order.tryOnId ?? undefined,
    totalAmount: order.totalAmount,
    totalFormatted: formatMoney(order.totalAmount, order.currency),
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
  };
}

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatMoney(amount: number, currency = "KZT") {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildDefaultOrderNote(availability: ProductAvailability, scheduledDate?: string) {
  if (availability === "preorder") {
    return scheduledDate ? `Preorder confirmed for ${scheduledDate}.` : "Preorder confirmed.";
  }

  return "Direct purchase confirmed.";
}

function canTransitionOrder(role: Role, currentStatus: OrderStatus, nextStatus: OrderStatus) {
  if (role === "franchisee") {
    return (
      (currentStatus === "pending_franchisee" && nextStatus === "in_production") ||
      (currentStatus === "ready" && nextStatus === "delivered")
    );
  }

  if (role === "production") {
    return (
      (currentStatus === "in_production" && nextStatus === "quality_check") ||
      (currentStatus === "quality_check" && nextStatus === "ready")
    );
  }

  return false;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseProductPayload(body: unknown) {
  const source = (body ?? {}) as Record<string, unknown>;
  return {
    name: String(source.name ?? "").trim(),
    subtitle: String(source.subtitle ?? "").trim() || "Editorial product card generated from admin.",
    categoryId: String(source.categoryId ?? "").trim(),
    priceAmount: Number(source.priceAmount ?? 0),
    availability: (String(source.availability ?? "in_stock") || "in_stock") as ProductAvailability,
    description: String(source.description ?? "").trim() || "New AVISHU catalog item.",
    composition: String(source.composition ?? "").trim() || "Premium material blend.",
    fittingNotes: String(source.fittingNotes ?? "").trim() || "Structured fit profile.",
    deliveryEstimate: String(source.deliveryEstimate ?? "").trim() || "Ships in 2-4 days.",
    featured: Boolean(source.featured ?? false),
    coverUrl: String(source.coverUrl ?? "").trim(),
    galleryUrls: Array.isArray(source.galleryUrls)
      ? source.galleryUrls.map((item) => String(item).trim()).filter(Boolean)
      : [],
    sizeLabels: Array.isArray(source.sizeLabels)
      ? source.sizeLabels.map((item) => String(item).trim().toUpperCase()).filter(Boolean)
      : [],
    style: Array.isArray(source.style)
      ? source.style.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
      : [],
    defaultStock: Number(source.defaultStock ?? 3),
  };
}

async function emitOrdersSnapshot() {
  const sockets = Array.from(io.sockets.sockets.values());

  await Promise.all(
    sockets.map(async (socket) => {
      const user = socket.data.user as User | undefined;

      if (!user) {
        return;
      }

      socket.emit("orders:sync", await listOrdersForUser(user));
    }),
  );
}

declare global {
  namespace Express {
    interface Request {
      user: User;
      token: string;
    }
  }
}
