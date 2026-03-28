export type Role = "client" | "admin" | "franchisee" | "production" | "support";

export type ProductAvailability = "in_stock" | "preorder";

export type OrderStatus =
  | "pending_franchisee"
  | "in_production"
  | "quality_check"
  | "ready"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "exchange_requested";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type DeliveryMethod = "pickup" | "courier";

export type PaymentMethod = "card" | "kaspi" | "transfer";

export type TryOnStatus = "uploaded" | "processing" | "ready" | "failed";

export type ThemePreference = "system" | "light" | "dark";

export type AppLanguage = "ru" | "kk" | "en";

export type PriorityLevel = "standard" | "high" | "vip";

export type LoyaltyTier = "silver" | "gold" | "black";

export type NotificationType =
  | "order_status"
  | "order_action"
  | "staff_action"
  | "reward"
  | "crm";

export type ContentKind =
  | "journal"
  | "lookbook"
  | "campaign"
  | "collection_story";

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
  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;
  segment: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  city: string;
  line1: string;
  line2?: string;
  isDefault: boolean;
}

export interface SavedPaymentCard {
  id: string;
  brand: string;
  holderName: string;
  last4: string;
  isDefault: boolean;
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
  colorLabel?: string;
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
  brandName: string;
  collectionName: string;
  dropName: string;
  seasonLabel: string;
  limitedEdition: boolean;
  limitedQuantity?: number;
  colors: string[];
  materials: string[];
  fitProfile: string;
  careInstructions: string;
  sizeGuide: string;
  editorialStory: string;
  relatedProductIds: string[];
  crossSellProductIds: string[];
  media: ProductMedia[];
  variants: ProductVariant[];
}

export interface Favorite {
  id: string;
  productId: string;
  createdAt: string;
}

export interface ProductView {
  id: string;
  productId: string;
  createdAt: string;
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

export interface OrderAuditLog {
  id: string;
  action: string;
  message: string;
  actorId?: string;
  actorName: string;
  actorRole: Role;
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
  priority: PriorityLevel;
  notes: string;
  shippingAddress: string;
  contactPhone: string;
  scheduledDate?: string;
  dueAt?: string;
  tryOnId?: string;
  totalAmount: number;
  totalFormatted: string;
  slaHours: number;
  returnRequested: boolean;
  exchangeRequested: boolean;
  cancellationRequested: boolean;
  qcChecklist?: string;
  internalTags: string[];
  createdAt: string;
  comments: OrderComment[];
  attachments: OrderAttachment[];
  auditLogs: OrderAuditLog[];
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
  favoriteCount: number;
  contentEntries: number;
}

export interface FunnelMetrics {
  productViews: number;
  productCards: number;
  cartAdds: number;
  checkouts: number;
  paidOrders: number;
  abandonedCarts: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  orderId?: string;
  roleTarget?: Role;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  tier: LoyaltyTier;
  active: boolean;
}

export interface Recommendation {
  id: string;
  productId: string;
  label: string;
  reason: string;
}

export interface ContentEntry {
  id: string;
  kind: ContentKind;
  slug: string;
  locale: AppLanguage;
  title: string;
  summary: string;
  body: string;
  coverUrl: string;
  eyebrow: string;
  featured: boolean;
  publishedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface BootstrapPayload {
  user: User;
  customers: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  tryOnSessions: TryOnSession[];
  metrics: DashboardMetrics;
  funnel: FunnelMetrics;
  favorites: Favorite[];
  productViews: ProductView[];
  savedAddresses: SavedAddress[];
  savedCards: SavedPaymentCard[];
  notifications: Notification[];
  rewards: Reward[];
  recommendations: Recommendation[];
  contentEntries: ContentEntry[];
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

export interface SavedAddressPayload {
  label: string;
  city: string;
  line1: string;
  line2?: string;
  isDefault: boolean;
}

export interface SavedPaymentCardPayload {
  brand: string;
  holderName: string;
  last4: string;
  isDefault: boolean;
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
  brandName: string;
  collectionName: string;
  dropName: string;
  seasonLabel: string;
  limitedEdition: boolean;
  limitedQuantity?: number;
  colors: string[];
  materials: string[];
  fitProfile: string;
  careInstructions: string;
  sizeGuide: string;
  editorialStory: string;
  relatedProductIds: string[];
  crossSellProductIds: string[];
}

export interface UpdateOrderWorkflowPayload {
  status?: OrderStatus;
  priority?: PriorityLevel;
  slaHours?: number;
  returnRequested?: boolean;
  exchangeRequested?: boolean;
  cancellationRequested?: boolean;
  qcChecklist?: string;
  tags?: string[];
  notifyClient?: boolean;
}

export interface ContentEntryUpsertPayload {
  kind: ContentKind;
  slug: string;
  locale: AppLanguage;
  title: string;
  summary: string;
  body: string;
  coverUrl: string;
  eyebrow: string;
  featured: boolean;
}
