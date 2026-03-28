import { AppLanguage, Order, Product, ProductVariant, TryOnSession, User } from "../../types";

export interface MetricVm {
  label: string;
  value: string;
}

export interface FilterChipVm {
  id: string;
  label: string;
  active: boolean;
  onPress: () => void;
}

export interface CatalogCollectionVm {
  id: string;
  title: string;
  description: string;
  countLabel: string;
  coverUrl?: string;
}

export interface CatalogSectionVm {
  id: string;
  title: string;
  subtitle: string;
  products: Product[];
}

export interface ClientHomeCopy {
  shellTitle: string;
  shellSubtitle: string;
  heroEyebrow: string;
  heroTitlePrefix: string;
  heroDescription: string;
  openProduct: string;
  openProfile: string;
  openCart: string;
  searchLabel: string;
  searchPlaceholder: string;
  categoryFilter: string;
  availabilityFilter: string;
  styleFilter: string;
  collectionsTitle: string;
  collectionsSubtitle: string;
  activeOrderTitle: string;
  activeOrderSubtitle: string;
  catalogTitle: string;
  catalogSubtitle: string;
  stockReady: string;
  stockPreorder: string;
  clearFilters: string;
}

export interface ClientHomeViewModel {
  language: AppLanguage;
  copy: ClientHomeCopy;
  featuredProduct?: Product;
  metrics: MetricVm[];
  cartCount: number;
  activeOrder: Order | null;
  categoryChips: FilterChipVm[];
  availabilityChips: FilterChipVm[];
  styleChips: FilterChipVm[];
  collections: CatalogCollectionVm[];
  sections: CatalogSectionVm[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onOpenCollection: (collectionId: string) => void;
  onOpenProduct: (productId: string) => void;
  onOpenProfile: () => void;
  onOpenCart: () => void;
  onClearFilters: () => void;
}

export interface ProductDetailCopy {
  shellTitle: string;
  sku: string;
  category: string;
  composition: string;
  fitNotes: string;
  delivery: string;
  style: string;
  sizeSelection: string;
  selectDelivery: string;
  gallery: string;
  tryOnTitle: string;
  tryOnSubtitle: string;
  sourceImage: string;
  sourceImagePlaceholder: string;
  tryOnHistory: string;
  generate: string;
  generating: string;
  ready: string;
  preorder: string;
  addToCart: string;
  continue: string;
  back: string;
  cart: string;
}

export interface ProductDetailViewModel {
  language: AppLanguage;
  copy: ProductDetailCopy;
  product: Product;
  activeMediaUrl?: string;
  activeMediaAlt?: string;
  activeMediaIndex: number;
  deliveryOptions: string[];
  selectedDate: string;
  selectedVariant?: ProductVariant;
  selectedTryOnId: string | null;
  photoUrl: string;
  submittingTryOn: boolean;
  productTryOns: TryOnSession[];
  styleLabels: string[];
  onSelectMedia: (index: number) => void;
  onSelectVariant: (variantId: string) => void;
  onSelectDate: (value: string) => void;
  onSelectTryOn: (tryOnId: string) => void;
  onPhotoUrlChange: (value: string) => void;
  onCreateTryOn: () => Promise<void>;
  onAddToCart: () => void;
  onContinue: () => void;
  onOpenCart: () => void;
  onBack: () => void;
}

export interface CartLineVm {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  total: number;
}

export interface CartCopy {
  shellTitle: string;
  shellSubtitle: string;
  emptyTitle: string;
  emptySubtitle: string;
  backToCatalog: string;
  cartTitle: string;
  cartSubtitle: string;
  payment: string;
  delivery: string;
  address: string;
  phone: string;
  notes: string;
  addressPlaceholder: string;
  phonePlaceholder: string;
  notesPlaceholder: string;
  remove: string;
  clear: string;
  minus: string;
  plus: string;
  size: string;
  qty: string;
  checkout: string;
  checkingOut: string;
  success: string;
  openProfile: string;
  total: string;
}

export interface CartViewModel {
  language: AppLanguage;
  copy: CartCopy;
  user: User | null;
  cartLines: CartLineVm[];
  paymentMethod: string;
  deliveryMethod: string;
  shippingAddress: string;
  contactPhone: string;
  notes: string;
  isSubmitting: boolean;
  successMessage: string;
  totalAmount: number;
  onSetPaymentMethod: (value: string) => void;
  onSetDeliveryMethod: (value: string) => void;
  onSetShippingAddress: (value: string) => void;
  onSetContactPhone: (value: string) => void;
  onSetNotes: (value: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCheckout: () => Promise<void>;
  onBackToCatalog: () => void;
  onOpenProfile: () => void;
}

export interface CheckoutFieldVm {
  label: string;
  value: string;
}

export interface CheckoutCopy {
  shellPayment: string;
  shellConfirmation: string;
  headerMeta: string;
  confirmedTitle: string;
  confirmedSubtitle: string;
  status: string;
  payment: string;
  delivery: string;
  address: string;
  openProfile: string;
  backToClient: string;
  realCheckout: string;
  realCheckoutSubtitle: string;
  paymentMethod: string;
  deliveryMethod: string;
  shippingAddress: string;
  contactPhone: string;
  notes: string;
  shippingPlaceholder: string;
  phonePlaceholder: string;
  notesPlaceholder: string;
  preorderDate: string;
  linkedTryOn: string;
  placing: string;
  confirm: string;
  back: string;
  size: string;
}

export interface CheckoutViewModel {
  language: AppLanguage;
  copy: CheckoutCopy;
  existingOrder: Order | null;
  product: Product | null;
  selectedVariant?: ProductVariant;
  paymentMethod: string;
  deliveryMethod: string;
  shippingAddress: string;
  contactPhone: string;
  notes: string;
  isSubmitting: boolean;
  scheduledDate?: string;
  tryOnId?: string;
  confirmationFields: CheckoutFieldVm[];
  onSetPaymentMethod: (value: string) => void;
  onSetDeliveryMethod: (value: string) => void;
  onSetShippingAddress: (value: string) => void;
  onSetContactPhone: (value: string) => void;
  onSetNotes: (value: string) => void;
  onConfirm: () => Promise<void>;
  onBack: () => void;
  onOpenProfile: () => void;
  onBackToClient: () => void;
}
