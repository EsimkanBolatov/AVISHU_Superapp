export type Role = "client" | "franchisee" | "production";

export type ProductAvailability = "in_stock" | "preorder";

export type OrderStatus = "pending_franchisee" | "in_production" | "ready";

export type ThemePreference = "system" | "light" | "dark";

export type AppLanguage = "ru" | "kk" | "en";

export interface User {
  id: string;
  name: string;
  role: Role;
  loyaltyProgress: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  availability: ProductAvailability;
  style: string[];
  description: string;
}

export interface Order {
  id: string;
  number: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  notes: string;
  scheduledDate?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  revenue: string;
  plan: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface BootstrapPayload {
  user: User;
  products: Product[];
  orders: Order[];
  metrics: DashboardMetrics;
}
