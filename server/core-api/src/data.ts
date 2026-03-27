import { Order, Product, Role, User } from "./types.js";

export const usersByRole: Record<Role, User> = {
  client: {
    id: "u-client-001",
    name: "Aigerim K.",
    role: "client",
    loyaltyProgress: 72,
  },
  franchisee: {
    id: "u-franchisee-001",
    name: "Madina S.",
    role: "franchisee",
    loyaltyProgress: 100,
  },
  production: {
    id: "u-production-001",
    name: "Gulmira T.",
    role: "production",
    loyaltyProgress: 100,
  },
};

export const products: Product[] = [
  {
    id: "p-001",
    sku: "AV-COAT-01",
    name: "Architect Coat",
    price: "189 000 ₸",
    availability: "in_stock",
    style: ["office", "sharp"],
    description: "Структурное пальто с прямой линией плеча и премиальной посадкой.",
  },
  {
    id: "p-002",
    sku: "AV-DRESS-02",
    name: "Gallery Dress",
    price: "124 000 ₸",
    availability: "preorder",
    style: ["editorial", "evening"],
    description: "Платье для витринного образа с длинным силуэтом и чистой геометрией.",
  },
  {
    id: "p-003",
    sku: "AV-SUIT-03",
    name: "Noir Suit",
    price: "211 000 ₸",
    availability: "in_stock",
    style: ["tailoring", "formal"],
    description: "Костюм с брутальной линией лацкана и минималистичным низом.",
  },
  {
    id: "p-004",
    sku: "AV-SHIRT-04",
    name: "Studio Shirt",
    price: "69 000 ₸",
    availability: "preorder",
    style: ["casual", "soft"],
    description: "Рубашка для многослойных образов с акцентом на пропорции и воздух.",
  },
];

export let orders: Order[] = [
  {
    id: "o-001",
    number: "AV-260327-001",
    productId: "p-003",
    productName: "Noir Suit",
    customerId: "u-client-001",
    customerName: "Aigerim K.",
    status: "in_production",
    notes: "PRIORITY / FIT CHECKED",
    createdAt: "2026-03-27T12:30:00.000Z",
  },
  {
    id: "o-002",
    number: "AV-260327-002",
    productId: "p-002",
    productName: "Gallery Dress",
    customerId: "u-client-001",
    customerName: "Aigerim K.",
    status: "pending_franchisee",
    notes: "PREORDER / DATE REQUIRED",
    scheduledDate: "2026-04-05",
    createdAt: "2026-03-27T13:00:00.000Z",
  },
];

export function createOrder(params: {
  productId: string;
  customerId: string;
  customerName: string;
  scheduledDate?: string;
}) {
  const product = products.find((item) => item.id === params.productId);

  if (!product) {
    throw new Error("Product not found");
  }

  const timestamp = new Date();
  const serial = String(orders.length + 1).padStart(3, "0");
  const order: Order = {
    id: `o-${Date.now()}`,
    number: `AV-${timestamp.toISOString().slice(2, 10).replace(/-/g, "")}-${serial}`,
    productId: product.id,
    productName: product.name,
    customerId: params.customerId,
    customerName: params.customerName,
    status: "pending_franchisee",
    notes:
      product.availability === "preorder"
        ? "PREORDER / DATE REQUIRED"
        : "DIRECT BUY / PAYMENT STUB",
    scheduledDate: params.scheduledDate,
    createdAt: timestamp.toISOString(),
  };

  orders = [order, ...orders];
  return order;
}

export function updateOrderStatus(orderId: string, status: Order["status"]) {
  orders = orders.map((order) => (order.id === orderId ? { ...order, status } : order));
  return orders.find((order) => order.id === orderId) ?? null;
}
