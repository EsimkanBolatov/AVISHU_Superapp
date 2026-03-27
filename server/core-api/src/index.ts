import "dotenv/config";

import { OrderStatus } from "@prisma/client";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { createServer } from "node:http";
import { Server } from "socket.io";

import { prisma } from "./prisma.js";
import { Product, Role, User } from "./types.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const port = Number(process.env.PORT ?? 3000);
const jwtSecret = process.env.JWT_SECRET ?? "super_hackathon_secret_avishu";

app.use(cors());
app.use(express.json());

app.get("/health", async (_request, response) => {
  const users = await prisma.user.count();
  response.json({ ok: true, users });
});

app.post("/api/core/v1/auth/login", async (request, response) => {
  const role = request.body?.role as Role | undefined;

  if (!role) {
    response.status(400).json({ message: "Unknown role" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { role },
  });

  if (!user) {
    response.status(404).json({ message: "Role not seeded" });
    return;
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret, {
    expiresIn: "7d",
  });

  response.json({ token, user: serializeUser(user) });
});

app.get("/api/core/v1/bootstrap", authMiddleware, async (request, response) => {
  const [products, orders] = await Promise.all([listProducts(), listOrders()]);

  response.json({
    user: request.user,
    products,
    orders,
    metrics: {
      revenue: "12.4M KZT",
      plan: "74%",
    },
  });
});

app.post("/api/core/v1/orders", authMiddleware, async (request, response) => {
  if (request.user.role !== "client") {
    response.status(403).json({ message: "Only clients can create orders" });
    return;
  }

  const productId = request.body?.productId as string | undefined;
  const scheduledDate = request.body?.scheduledDate as string | undefined;

  if (!productId) {
    response.status(400).json({ message: "productId is required" });
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    response.status(404).json({ message: "Product not found" });
    return;
  }

  const count = await prisma.order.count();
  const timestamp = new Date();
  const createdOrder = await prisma.order.create({
    data: {
      id: `o-${Date.now()}`,
      number: `AV-${timestamp.toISOString().slice(2, 10).replace(/-/g, "")}-${String(count + 1).padStart(3, "0")}`,
      productId: product.id,
      customerId: request.user.id,
      status: "pending_franchisee",
      notes:
        product.availability === "preorder"
          ? "PREORDER / DATE REQUIRED"
          : "DIRECT BUY / PAYMENT STUB",
      scheduledDate: scheduledDate ? new Date(`${scheduledDate}T00:00:00.000Z`) : null,
    },
    include: {
      product: true,
      customer: true,
    },
  });

  await emitOrdersSnapshot();
  response.status(201).json({ order: serializeOrder(createdOrder) });
});

app.patch("/api/core/v1/orders/:id/status", authMiddleware, async (request, response) => {
  if (request.user.role === "client") {
    response.status(403).json({ message: "Client cannot update order status" });
    return;
  }

  const orderId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const status = request.body?.status as OrderStatus | undefined;

  if (!status) {
    response.status(400).json({ message: "status is required" });
    return;
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    response.status(404).json({ message: "Order not found" });
    return;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      product: true,
      customer: true,
    },
  });

  await emitOrdersSnapshot();
  response.json({ order: serializeOrder(updatedOrder) });
});

io.on("connection", (socket) => {
  void listOrders().then((orders) => {
    socket.emit("orders:sync", orders);
  });
});

void prisma.$connect().then(() => {
  httpServer.listen(port, () => {
    console.log(`AVISHU core API listening on http://localhost:${port}`);
  });
});

async function authMiddleware(
  request: Request & { user?: User },
  response: Response,
  next: NextFunction,
) {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = header.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, jwtSecret) as { role: Role; userId: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      response.status(401).json({ message: "Unknown user" });
      return;
    }

    request.user = serializeUser(user);
    next();
  } catch {
    response.status(401).json({ message: "Invalid token" });
  }
}

async function listProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: { sku: "asc" },
  });

  return products.map((product) => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    price: product.price,
    availability: product.availability,
    style: product.style,
    description: product.description,
  }));
}

async function listOrders() {
  const orders = await prisma.order.findMany({
    include: {
      product: true,
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map(serializeOrder);
}

type OrderWithRelations = Awaited<ReturnType<typeof prisma.order.findFirst>> & {
  product: {
    id: string;
    name: string;
  };
  customer: {
    id: string;
    name: string;
  };
};

function serializeOrder(order: OrderWithRelations) {
  return {
    id: order.id,
    number: order.number,
    productId: order.productId,
    productName: order.product.name,
    customerId: order.customerId,
    customerName: order.customer.name,
    status: order.status,
    notes: order.notes,
    scheduledDate: order.scheduledDate?.toISOString().slice(0, 10),
    createdAt: order.createdAt.toISOString(),
  };
}

function serializeUser(user: { id: string; name: string; role: Role; loyaltyProgress: number }) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    loyaltyProgress: user.loyaltyProgress,
  };
}

async function emitOrdersSnapshot() {
  const orders = await listOrders();
  io.emit("orders:sync", orders);
}

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
