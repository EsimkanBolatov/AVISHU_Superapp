import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { io, Socket } from "socket.io-client";
import { create } from "zustand";

declare const require: {
  <T = unknown>(path: string): T;
};

const zustandMiddleware = require<typeof import("zustand/middleware")>("zustand/middleware");
const { createJSONStorage, persist } = zustandMiddleware;

import {
  addOrderAttachmentRequest,
  addOrderCommentRequest,
  bootstrapRequest,
  CORE_API_URL,
  createAddressRequest,
  createCardRequest,
  createContentRequest,
  createFavoriteRequest,
  createProductRequest,
  createTryOnRequest,
  deleteAddressRequest,
  deleteCardRequest,
  deleteContentRequest,
  deleteFavoriteRequest,
  deleteProductRequest,
  loginRequest,
  logoutRequest,
  markNotificationReadRequest,
  placeOrderRequest,
  registerRequest,
  trackProductViewRequest,
  updateAddressRequest,
  updateCardRequest,
  updateContentRequest,
  updateOrderStatusRequest,
  updateOrderWorkflowRequest,
  updateProductRequest,
  updateProfileRequest,
} from "../lib/api";
import {
  AppLanguage,
  AuthPayload,
  BootstrapPayload,
  CartItem,
  Category,
  ContentEntry,
  ContentEntryUpsertPayload,
  CreateTryOnPayload,
  DashboardMetrics,
  Favorite,
  FunnelMetrics,
  Notification,
  Order,
  OrderStatus,
  PlaceOrderPayload,
  Product,
  ProductUpsertPayload,
  ProductView,
  Recommendation,
  RegisterPayload,
  Reward,
  SavedAddress,
  SavedAddressPayload,
  SavedPaymentCard,
  SavedPaymentCardPayload,
  ThemePreference,
  TryOnSession,
  UpdateOrderWorkflowPayload,
  UpdateProfilePayload,
  User,
} from "../types";

interface AppState {
  token: string | null;
  user: User | null;
  customers: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  tryOnSessions: TryOnSession[];
  cartItems: CartItem[];
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
  activeOrder: Order | null;
  language: AppLanguage;
  themePreference: ThemePreference;
  desktopHeaderCollapsed: boolean;
  isLoading: boolean;
  isHydrating: boolean;
  isOffline: boolean;
  lastError: string | null;
  socket: Socket | null;
  hydrate: () => Promise<void>;
  refreshBootstrap: () => Promise<void>;
  setLanguage: (language: AppLanguage) => void;
  setThemePreference: (preference: ThemePreference) => void;
  setDesktopHeaderCollapsed: (collapsed: boolean) => void;
  clearError: () => void;
  login: (payload: AuthPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  createAddress: (payload: SavedAddressPayload) => Promise<void>;
  updateAddress: (addressId: string, payload: SavedAddressPayload) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  createCard: (payload: SavedPaymentCardPayload) => Promise<void>;
  updateCard: (cardId: string, payload: SavedPaymentCardPayload) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  createTryOn: (payload: CreateTryOnPayload) => Promise<TryOnSession>;
  placeOrder: (payload: PlaceOrderPayload) => Promise<Order>;
  repeatOrder: (orderId: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderWorkflow: (orderId: string, payload: UpdateOrderWorkflowPayload) => Promise<void>;
  addOrderComment: (orderId: string, message: string) => Promise<void>;
  addOrderAttachment: (orderId: string, payload: { label: string; url: string }) => Promise<void>;
  createProduct: (payload: ProductUpsertPayload) => Promise<void>;
  updateProduct: (productId: string, payload: Partial<ProductUpsertPayload>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  createContent: (payload: ContentEntryUpsertPayload) => Promise<void>;
  updateContent: (contentId: string, payload: Partial<ContentEntryUpsertPayload>) => Promise<void>;
  deleteContent: (contentId: string) => Promise<void>;
  trackProductView: (productId: string) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  addToCart: (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
}

const EMPTY_METRICS: DashboardMetrics = {
  revenue: "0",
  plan: "0%",
  products: 0,
  orders: 0,
  readyOrders: 0,
  favoriteCount: 0,
  contentEntries: 0,
};

const EMPTY_FUNNEL: FunnelMetrics = {
  productViews: 0,
  productCards: 0,
  cartAdds: 0,
  checkouts: 0,
  paidOrders: 0,
  abandonedCarts: 0,
};

function getActiveOrder(user: User | null, orders: Order[]) {
  if (!user || user.role !== "client") {
    return null;
  }

  return (
    orders
      .filter((order) => order.customerId === user.id)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0] ?? null
  );
}

function mapBootstrap(token: string, bootstrap: BootstrapPayload, cartItems: CartItem[]) {
  return {
    token,
    user: bootstrap.user,
    customers: bootstrap.customers,
    categories: bootstrap.categories,
    products: bootstrap.products,
    orders: bootstrap.orders,
    tryOnSessions: bootstrap.tryOnSessions,
    metrics: bootstrap.metrics,
    funnel: bootstrap.funnel,
    favorites: bootstrap.favorites,
    productViews: bootstrap.productViews,
    savedAddresses: bootstrap.savedAddresses,
    savedCards: bootstrap.savedCards,
    notifications: bootstrap.notifications,
    rewards: bootstrap.rewards,
    recommendations: bootstrap.recommendations,
    contentEntries: bootstrap.contentEntries,
    cartItems,
    activeOrder: getActiveOrder(bootstrap.user, bootstrap.orders),
    isOffline: false,
    lastError: null,
  };
}

function upsertOrder(current: Order[], next: Order) {
  const withoutCurrent = current.filter((item) => item.id !== next.id);
  return [next, ...withoutCurrent].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function upsertProduct(current: Product[], next: Product) {
  const withoutCurrent = current.filter((item) => item.id !== next.id);
  return [next, ...withoutCurrent].sort(
    (left, right) => Number(right.featured) - Number(left.featured) || left.name.localeCompare(right.name),
  );
}

function upsertContent(current: ContentEntry[], next: ContentEntry) {
  const withoutCurrent = current.filter((item) => item.id !== next.id);
  return [next, ...withoutCurrent].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

function upsertNotification(current: Notification[], next: Notification) {
  const withoutCurrent = current.filter((item) => item.id !== next.id);
  return [next, ...withoutCurrent].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function upsertFavorite(current: Favorite[], next: Favorite) {
  const withoutCurrent = current.filter((item) => item.id !== next.id);
  return [next, ...withoutCurrent].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function upsertProductView(current: ProductView[], next: ProductView) {
  const withoutCurrent = current.filter((item) => item.id !== next.id);
  return [next, ...withoutCurrent].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function buildCartItemId(productId: string, variantId: string, scheduledDate?: string, tryOnId?: string) {
  return [productId, variantId, scheduledDate ?? "", tryOnId ?? ""].join(":");
}

function setNetworkSuccess(set: (partial: Partial<AppState>) => void) {
  set({ isOffline: false, lastError: null });
}

function setNetworkFailure(set: (partial: Partial<AppState>) => void, error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected request failure.";
  const isOffline =
    error instanceof TypeError || /network/i.test(message) || /fetch/i.test(message) || /offline/i.test(message);

  set({
    lastError: message,
    isOffline,
  });
}

function attachSocket(token: string, set: (partial: Partial<AppState>) => void, get: () => AppState) {
  get().socket?.disconnect();

  const socket = io(CORE_API_URL, {
    transports: ["websocket"],
    auth: {
      token,
    },
  });

  socket.on("orders:sync", (orders: Order[]) => {
    const user = get().user;
    set({
      orders,
      activeOrder: getActiveOrder(user, orders),
    });
  });

  socket.on("notifications:sync", (notifications: Notification[]) => {
    set({
      notifications,
    });
  });

  set({ socket });
}

function clearSessionState(set: (partial: Partial<AppState>) => void, get: () => AppState) {
  get().socket?.disconnect();
  set({
    token: null,
    user: null,
    customers: [],
    categories: [],
    products: [],
    orders: [],
    tryOnSessions: [],
    metrics: EMPTY_METRICS,
    funnel: EMPTY_FUNNEL,
    favorites: [],
    productViews: [],
    savedAddresses: [],
    savedCards: [],
    notifications: [],
    rewards: [],
    recommendations: [],
    contentEntries: [],
    activeOrder: null,
    socket: null,
    isOffline: false,
    lastError: null,
  });
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      customers: [],
      categories: [],
      products: [],
      orders: [],
      tryOnSessions: [],
      cartItems: [],
      metrics: EMPTY_METRICS,
      funnel: EMPTY_FUNNEL,
      favorites: [],
      productViews: [],
      savedAddresses: [],
      savedCards: [],
      notifications: [],
      rewards: [],
      recommendations: [],
      contentEntries: [],
      activeOrder: null,
      language: "ru",
      themePreference: "system",
      desktopHeaderCollapsed: false,
      isLoading: false,
      isHydrating: false,
      isOffline: false,
      lastError: null,
      socket: null,
      hydrate: async () => {
        void i18n.changeLanguage(get().language);

        const token = get().token;

        if (!token) {
          return;
        }

        set({ isHydrating: true });

        try {
          const bootstrap = await bootstrapRequest(token);
          attachSocket(token, set, get);
          set({
            ...mapBootstrap(token, bootstrap, get().cartItems),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          clearSessionState(set, get);
        } finally {
          set({ isHydrating: false });
        }
      },
      refreshBootstrap: async () => {
        const token = get().token;

        if (!token) {
          return;
        }

        try {
          const bootstrap = await bootstrapRequest(token);
          set({
            ...mapBootstrap(token, bootstrap, get().cartItems),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      setLanguage: (language) => {
        set({ language });
        void i18n.changeLanguage(language);
      },
      setThemePreference: (themePreference) => set({ themePreference }),
      setDesktopHeaderCollapsed: (desktopHeaderCollapsed) => set({ desktopHeaderCollapsed }),
      clearError: () => set({ lastError: null, isOffline: false }),
      login: async (payload) => {
        set({ isLoading: true });

        try {
          const auth = await loginRequest(payload);
          const bootstrap = await bootstrapRequest(auth.token);
          attachSocket(auth.token, set, get);
          setNetworkSuccess(set);
          set({
            ...mapBootstrap(auth.token, bootstrap, get().cartItems),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      register: async (payload) => {
        set({ isLoading: true });

        try {
          const auth = await registerRequest(payload);
          const bootstrap = await bootstrapRequest(auth.token);
          attachSocket(auth.token, set, get);
          setNetworkSuccess(set);
          set({
            ...mapBootstrap(auth.token, bootstrap, get().cartItems),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      logout: async () => {
        const token = get().token;

        if (token) {
          try {
            await logoutRequest(token);
          } catch {
            // Ignore logout failures and clear local session anyway.
          }
        }

        clearSessionState(set, get);
      },
      updateProfile: async (payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          const response = await updateProfileRequest(token, payload);
          setNetworkSuccess(set);
          set({ user: response.user });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      createAddress: async (payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          await createAddressRequest(token, payload);
          await get().refreshBootstrap();
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      updateAddress: async (addressId, payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          await updateAddressRequest(token, addressId, payload);
          await get().refreshBootstrap();
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      deleteAddress: async (addressId) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          await deleteAddressRequest(token, addressId);
          await get().refreshBootstrap();
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      createCard: async (payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          await createCardRequest(token, payload);
          await get().refreshBootstrap();
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      updateCard: async (cardId, payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          await updateCardRequest(token, cardId, payload);
          await get().refreshBootstrap();
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      deleteCard: async (cardId) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          await deleteCardRequest(token, cardId);
          await get().refreshBootstrap();
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      createTryOn: async (payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          const response = await createTryOnRequest(token, payload);
          setNetworkSuccess(set);
          set({
            tryOnSessions: [response.tryOn, ...get().tryOnSessions],
          });
          return response.tryOn;
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      placeOrder: async (payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          const response = await placeOrderRequest(token, payload);
          const nextOrders = upsertOrder(get().orders, response.order);
          const user = get().user;
          setNetworkSuccess(set);
          set({
            orders: nextOrders,
            activeOrder: getActiveOrder(user, nextOrders),
          });
          return response.order;
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      repeatOrder: async (orderId) => {
        const order = get().orders.find((item) => item.id === orderId);

        if (!order?.variantId) {
          throw new Error("Order variant is missing.");
        }

        return get().placeOrder({
          productId: order.productId,
          variantId: order.variantId,
          paymentMethod: order.paymentMethod,
          deliveryMethod: order.deliveryMethod,
          shippingAddress: order.shippingAddress,
          contactPhone: order.contactPhone,
          scheduledDate: order.scheduledDate,
          notes: `Repeat order based on ${order.number}.`,
          tryOnId: order.tryOnId,
        });
      },
      updateOrderStatus: async (orderId, status) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          const response = await updateOrderStatusRequest(token, orderId, status);
          const nextOrders = upsertOrder(get().orders, response.order);
          const user = get().user;
          setNetworkSuccess(set);
          set({
            orders: nextOrders,
            activeOrder: getActiveOrder(user, nextOrders),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      updateOrderWorkflow: async (orderId, payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          const response = await updateOrderWorkflowRequest(token, orderId, payload);
          const nextOrders = upsertOrder(get().orders, response.order);
          const user = get().user;
          setNetworkSuccess(set);
          set({
            orders: nextOrders,
            activeOrder: getActiveOrder(user, nextOrders),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      addOrderComment: async (orderId, message) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          const response = await addOrderCommentRequest(token, orderId, message);
          const nextOrders = upsertOrder(get().orders, response.order);
          const user = get().user;
          setNetworkSuccess(set);
          set({
            orders: nextOrders,
            activeOrder: getActiveOrder(user, nextOrders),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      addOrderAttachment: async (orderId, payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          const response = await addOrderAttachmentRequest(token, orderId, payload);
          const nextOrders = upsertOrder(get().orders, response.order);
          const user = get().user;
          setNetworkSuccess(set);
          set({
            orders: nextOrders,
            activeOrder: getActiveOrder(user, nextOrders),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      createProduct: async (payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          const response = await createProductRequest(token, payload);
          setNetworkSuccess(set);
          set({
            products: upsertProduct(get().products, response.product),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      updateProduct: async (productId, payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          const response = await updateProductRequest(token, productId, payload);
          setNetworkSuccess(set);
          set({
            products: upsertProduct(get().products, response.product),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      deleteProduct: async (productId) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          await deleteProductRequest(token, productId);
          setNetworkSuccess(set);
          set({
            products: get().products.filter((product) => product.id !== productId),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      createContent: async (payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          const response = await createContentRequest(token, payload);
          setNetworkSuccess(set);
          set({
            contentEntries: upsertContent(get().contentEntries, response.contentEntry),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      updateContent: async (contentId, payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          const response = await updateContentRequest(token, contentId, payload);
          setNetworkSuccess(set);
          set({
            contentEntries: upsertContent(get().contentEntries, response.contentEntry),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      deleteContent: async (contentId) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          await deleteContentRequest(token, contentId);
          setNetworkSuccess(set);
          set({
            contentEntries: get().contentEntries.filter((entry) => entry.id !== contentId),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      trackProductView: async (productId) => {
        const token = get().token;
        const user = get().user;

        if (!token || user?.role !== "client") {
          return;
        }

        try {
          const response = await trackProductViewRequest(token, productId);
          setNetworkSuccess(set);
          set({
            productViews: upsertProductView(get().productViews, response.view),
          });
        } catch (error) {
          setNetworkFailure(set, error);
        }
      },
      toggleFavorite: async (productId) => {
        const token = get().token;
        const user = get().user;

        if (!token || user?.role !== "client") {
          return;
        }

        try {
          const current = get().favorites.find((item) => item.productId === productId);

          if (current) {
            await deleteFavoriteRequest(token, productId);
            setNetworkSuccess(set);
            set({
              favorites: get().favorites.filter((item) => item.productId !== productId),
            });
            return;
          }

          const response = await createFavoriteRequest(token, productId);
          setNetworkSuccess(set);
          set({
            favorites: upsertFavorite(get().favorites, response.favorite),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      markNotificationRead: async (notificationId) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        try {
          const response = await markNotificationReadRequest(token, notificationId);
          setNetworkSuccess(set);
          set({
            notifications: upsertNotification(get().notifications, response.notification),
          });
        } catch (error) {
          setNetworkFailure(set, error);
          throw error;
        }
      },
      addToCart: ({ productId, variantId, quantity = 1, scheduledDate, tryOnId }) => {
        const id = buildCartItemId(productId, variantId, scheduledDate, tryOnId);
        const current = get().cartItems;
        const existing = current.find((item) => item.id === id);

        if (existing) {
          set({
            cartItems: current.map((item) =>
              item.id === id ? { ...item, quantity: item.quantity + quantity } : item,
            ),
          });
          return;
        }

        set({
          cartItems: [
            ...current,
            {
              id,
              productId,
              variantId,
              quantity,
              scheduledDate,
              tryOnId,
            },
          ],
        });
      },
      updateCartQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          set({
            cartItems: get().cartItems.filter((item) => item.id !== itemId),
          });
          return;
        }

        set({
          cartItems: get().cartItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
        });
      },
      removeFromCart: (itemId) => {
        set({
          cartItems: get().cartItems.filter((item) => item.id !== itemId),
        });
      },
      clearCart: () => {
        set({ cartItems: [] });
      },
    }),
    {
      name: "avishu-ui-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        themePreference: state.themePreference,
        desktopHeaderCollapsed: state.desktopHeaderCollapsed,
        token: state.token,
        cartItems: state.cartItems,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          void i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);
