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
  createProductRequest,
  createTryOnRequest,
  deleteProductRequest,
  loginRequest,
  logoutRequest,
  placeOrderRequest,
  registerRequest,
  updateOrderStatusRequest,
  updateProductRequest,
  updateProfileRequest,
} from "../lib/api";
import {
  AppLanguage,
  AuthPayload,
  BootstrapPayload,
  CartItem,
  Category,
  CreateTryOnPayload,
  DashboardMetrics,
  Order,
  OrderStatus,
  PlaceOrderPayload,
  Product,
  ProductUpsertPayload,
  RegisterPayload,
  ThemePreference,
  TryOnSession,
  UpdateProfilePayload,
  User,
} from "../types";

interface AppState {
  token: string | null;
  user: User | null;
  categories: Category[];
  products: Product[];
  orders: Order[];
  tryOnSessions: TryOnSession[];
  cartItems: CartItem[];
  metrics: DashboardMetrics;
  activeOrder: Order | null;
  language: AppLanguage;
  themePreference: ThemePreference;
  isLoading: boolean;
  socket: Socket | null;
  hydrate: () => Promise<void>;
  refreshBootstrap: () => Promise<void>;
  setLanguage: (language: AppLanguage) => void;
  setThemePreference: (preference: ThemePreference) => void;
  login: (payload: AuthPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  createTryOn: (payload: CreateTryOnPayload) => Promise<TryOnSession>;
  placeOrder: (payload: PlaceOrderPayload) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addOrderComment: (orderId: string, message: string) => Promise<void>;
  addOrderAttachment: (orderId: string, payload: { label: string; url: string }) => Promise<void>;
  createProduct: (payload: ProductUpsertPayload) => Promise<void>;
  updateProduct: (productId: string, payload: Partial<ProductUpsertPayload>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
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
    categories: bootstrap.categories,
    products: bootstrap.products,
    orders: bootstrap.orders,
    tryOnSessions: bootstrap.tryOnSessions,
    metrics: bootstrap.metrics,
    cartItems,
    activeOrder: getActiveOrder(bootstrap.user, bootstrap.orders),
  };
}

function upsertOrder(current: Order[], next: Order) {
  const withoutCurrent = current.filter((item) => item.id !== next.id);
  return [next, ...withoutCurrent].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function upsertProduct(current: Product[], next: Product) {
  const withoutCurrent = current.filter((item) => item.id !== next.id);
  return [next, ...withoutCurrent].sort((left, right) =>
    Number(right.featured) - Number(left.featured) || left.name.localeCompare(right.name),
  );
}

function attachSocket(
  token: string,
  set: (partial: Partial<AppState>) => void,
  get: () => AppState,
) {
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

  set({ socket });
}

function clearSessionState(set: (partial: Partial<AppState>) => void, get: () => AppState) {
  get().socket?.disconnect();
  set({
    token: null,
    user: null,
    categories: [],
    products: [],
    orders: [],
    tryOnSessions: [],
    metrics: EMPTY_METRICS,
    activeOrder: null,
    socket: null,
  });
}

function buildCartItemId(productId: string, variantId: string, scheduledDate?: string, tryOnId?: string) {
  return [productId, variantId, scheduledDate ?? "", tryOnId ?? ""].join(":");
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      categories: [],
      products: [],
      orders: [],
      tryOnSessions: [],
      cartItems: [],
      metrics: EMPTY_METRICS,
      activeOrder: null,
      language: "ru",
      themePreference: "system",
      isLoading: false,
      socket: null,
      hydrate: async () => {
        void i18n.changeLanguage(get().language);

        const token = get().token;

        if (!token) {
          return;
        }

        try {
          const bootstrap = await bootstrapRequest(token);
          attachSocket(token, set, get);
          set({
            ...mapBootstrap(token, bootstrap, get().cartItems),
          });
        } catch {
          clearSessionState(set, get);
        }
      },
      refreshBootstrap: async () => {
        const token = get().token;

        if (!token) {
          return;
        }

        const bootstrap = await bootstrapRequest(token);
        set({
          ...mapBootstrap(token, bootstrap, get().cartItems),
        });
      },
      setLanguage: (language) => {
        set({ language });
        void i18n.changeLanguage(language);
      },
      setThemePreference: (themePreference) => set({ themePreference }),
      login: async (payload) => {
        set({ isLoading: true });

        try {
          const auth = await loginRequest(payload);
          const bootstrap = await bootstrapRequest(auth.token);
          attachSocket(auth.token, set, get);
          set({
            ...mapBootstrap(auth.token, bootstrap, get().cartItems),
          });
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
          set({
            ...mapBootstrap(auth.token, bootstrap, get().cartItems),
          });
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
            // Ignore logout network failures and clear local session anyway.
          }
        }

        clearSessionState(set, get);
      },
      updateProfile: async (payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        const response = await updateProfileRequest(token, payload);
        set({ user: response.user });
      },
      createTryOn: async (payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        const response = await createTryOnRequest(token, payload);
        set({
          tryOnSessions: [response.tryOn, ...get().tryOnSessions],
        });
        return response.tryOn;
      },
      placeOrder: async (payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        const response = await placeOrderRequest(token, payload);
        const nextOrders = upsertOrder(get().orders, response.order);
        const user = get().user;
        const activeOrder = getActiveOrder(user, nextOrders);

        set({ orders: nextOrders, activeOrder });
        return response.order;
      },
      updateOrderStatus: async (orderId, status) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        const response = await updateOrderStatusRequest(token, orderId, status);
        const nextOrders = upsertOrder(get().orders, response.order);
        const user = get().user;
        const activeOrder = getActiveOrder(user, nextOrders);

        set({ orders: nextOrders, activeOrder });
      },
      addOrderComment: async (orderId, message) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        const response = await addOrderCommentRequest(token, orderId, message);
        const nextOrders = upsertOrder(get().orders, response.order);
        const user = get().user;
        const activeOrder = getActiveOrder(user, nextOrders);

        set({ orders: nextOrders, activeOrder });
      },
      addOrderAttachment: async (orderId, payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        const response = await addOrderAttachmentRequest(token, orderId, payload);
        const nextOrders = upsertOrder(get().orders, response.order);
        const user = get().user;
        const activeOrder = getActiveOrder(user, nextOrders);

        set({ orders: nextOrders, activeOrder });
      },
      createProduct: async (payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        const response = await createProductRequest(token, payload);
        set({
          products: upsertProduct(get().products, response.product),
        });
      },
      updateProduct: async (productId, payload) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        const response = await updateProductRequest(token, productId, payload);
        set({
          products: upsertProduct(get().products, response.product),
        });
      },
      deleteProduct: async (productId) => {
        const token = get().token;

        if (!token) {
          throw new Error("No session");
        }

        await deleteProductRequest(token, productId);
        set({
          products: get().products.filter((product) => product.id !== productId),
        });
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
          cartItems: get().cartItems.map((item) =>
            item.id === itemId ? { ...item, quantity } : item,
          ),
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
