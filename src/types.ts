export type Role = "client" | "franchisee" | "production";

export type ProductAvailability = "in_stock" | "preorder";

export type OrderStatus =
  | "pending_franchisee"
  | "in_production"
  | "quality_check"
  | "ready"
  | "delivered";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type DeliveryMethod = "pickup" | "courier";

export type PaymentMethod = "card" | "kaspi" | "transfer";

export type TryOnStatus = "uploaded" | "processing" | "ready" | "failed";

export type ThemePreference = "system" | "light" | "dark";

export type AppLanguage = "ru" | "kk" | "en";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  defaultShippingAddress?: string;
  paymentCardBrand?: string;
  paymentCardLast4?: string;
  paymentCardHolder?: string;
  loyaltyProgress: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface ProductMedia {
  id: string;
  url: string;
  alt: string;
  kind: "cover" | "gallery" | "detail";
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sizeLabel: string;
  stock: number;
  reserved: number;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  subtitle: string;
  priceAmount: number;
  currency: string;
  formattedPrice: string;
  availability: ProductAvailability;
  style: string[];
  description: string;
  composition: string;
  fittingNotes: string;
  deliveryEstimate: string;
  featured: boolean;
  categoryId: string;
  categoryName: string;
  media: ProductMedia[];
  variants: ProductVariant[];
}

export interface OrderComment {
  id: string;
  message: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  createdAt: string;
}

export interface OrderAttachment {
  id: string;
  label: string;
  url: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface TryOnSession {
  id: string;
  userId: string;
  productId: string;
  sourceImageUrl: string;
  resultImageUrl?: string;
  status: TryOnStatus;
  notes: string;
  createdAt: string;
}

export interface Order {
  id: string;
  number: string;
  productId: string;
  productName: string;
  productSku: string;
  productMediaUrl?: string;
  variantId?: string;
  sizeLabel?: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  notes: string;
  shippingAddress: string;
  contactPhone: string;
  scheduledDate?: string;
  tryOnId?: string;
  totalAmount: number;
  totalFormatted: string;
  createdAt: string;
  comments: OrderComment[];
  attachments: OrderAttachment[];
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  scheduledDate?: string;
  tryOnId?: string;
}

export interface DashboardMetrics {
  revenue: string;
  plan: string;
  products: number;
  orders: number;
  readyOrders: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface BootstrapPayload {
  user: User;
  categories: Category[];
  products: Product[];
  orders: Order[];
  tryOnSessions: TryOnSession[];
  metrics: DashboardMetrics;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthPayload {
  name: string;
}

export interface CreateTryOnPayload {
  productId: string;
  sourceImageUrl: string;
  notes?: string;
}

export interface PlaceOrderPayload {
  productId: string;
  variantId: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  contactPhone: string;
  scheduledDate?: string;
  notes?: string;
  tryOnId?: string;
}

export interface UpdateProfilePayload {
  name: string;
  phone?: string;
  defaultShippingAddress?: string;
  paymentCardBrand?: string;
  paymentCardLast4?: string;
  paymentCardHolder?: string;
}

export interface ProductUpsertPayload {
  name: string;
  subtitle: string;
  categoryId: string;
  priceAmount: number;
  availability: ProductAvailability;
  description: string;
  composition: string;
  fittingNotes: string;
  deliveryEstimate: string;
  featured: boolean;
  coverUrl: string;
  galleryUrls: string[];
  sizeLabels: string[];
  style: string[];
  defaultStock: number;
}
