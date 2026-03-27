import "dotenv/config";

import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { createServer } from "node:http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import { createOrder, orders, products, updateOrderStatus, usersByRole } from "./data.js";
import { Role, User } from "./types.js";

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

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/core/v1/auth/login", (request, response) => {
  const role = request.body?.role as Role | undefined;

  if (!role || !(role in usersByRole)) {
    response.status(400).json({ message: "Unknown role" });
    return;
  }

  const user = usersByRole[role];
  const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret, {
    expiresIn: "7d",
  });

  response.json({ token, user });
});

app.get("/api/core/v1/bootstrap", authMiddleware, (request, response) => {
  response.json({
    user: request.user,
    products,
    orders,
    metrics: {
      revenue: "12.4M ₸",
      plan: "74%",
    },
  });
});

app.post("/api/core/v1/orders", authMiddleware, (request, response) => {
  if (request.user.role !== "client") {
    response.status(403).json({ message: "Only clients can create orders" });
    return;
  }

  const order = createOrder({
    productId: request.body?.productId,
    scheduledDate: request.body?.scheduledDate,
    customerId: request.user.id,
    customerName: request.user.name,
  });

  io.emit("orders:sync", orders);
  response.status(201).json({ order });
});

app.patch("/api/core/v1/orders/:id/status", authMiddleware, (request, response) => {
  if (request.user.role === "client") {
    response.status(403).json({ message: "Client cannot update order status" });
    return;
  }

  const orderId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const order = updateOrderStatus(orderId, request.body?.status);

  if (!order) {
    response.status(404).json({ message: "Order not found" });
    return;
  }

  io.emit("orders:sync", orders);
  response.json({ order });
});

io.on("connection", (socket) => {
  socket.emit("orders:sync", orders);
});

httpServer.listen(port, () => {
  console.log(`AVISHU core API listening on http://localhost:${port}`);
});

function authMiddleware(
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
    const user = Object.values(usersByRole).find((item) => item.id === payload.userId);

    if (!user) {
      response.status(401).json({ message: "Unknown user" });
      return;
    }

    request.user = user;
    next();
  } catch {
    response.status(401).json({ message: "Invalid token" });
  }
}

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
