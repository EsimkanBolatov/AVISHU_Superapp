import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware.js";

import {
  bootstrapRequest,
  CORE_API_URL,
  loginRequest,
  placeOrderRequest,
  updateOrderStatusRequest,
} from "../lib/api";
import {
  AppLanguage,
  BootstrapPayload,
  DashboardMetrics,
  Order,
  OrderStatus,
  Product,
  Role,
  ThemePreference,
  User,
} from "../types";

interface AppState {
  token: string | null;
  user: User | null;
  products: Product[];
  orders: Order[];
  metrics: DashboardMetrics;
  activeOrder: Order | null;
  language: AppLanguage;
  themePreference: ThemePreference;
  isLoading: boolean;
  socket: Socket | null;
  hydrate: () => void;
  setLanguage: (language: AppLanguage) => void;
  setThemePreference: (preference: ThemePreference) => void;
  login: (role: Role) => Promise<void>;
  logout: () => void;
  placeOrder: (productId: string, scheduledDate?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

const EMPTY_METRICS: DashboardMetrics = {
  revenue: "0",
  plan: "0%",
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

function mapBootstrap(token: string, bootstrap: BootstrapPayload) {
  return {
    token,
    user: bootstrap.user,
    products: bootstrap.products,
    orders: bootstrap.orders,
    metrics: bootstrap.metrics,
    activeOrder: getActiveOrder(bootstrap.user, bootstrap.orders),
  };
}

function upsertOrder(current: Order[], next: Order) {
  const withoutCurrent = current.filter((item) => item.id !== next.id);
  return [next, ...withoutCurrent].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      products: [],
      orders: [],
      metrics: EMPTY_METRICS,
      activeOrder: null,
      language: "ru",
      themePreference: "system",
      isLoading: false,
      socket: null,
      hydrate: () => {
        void i18n.changeLanguage(get().language);
      },
      setLanguage: (language) => {
        set({ language });
        void i18n.changeLanguage(language);
      },
      setThemePreference: (themePreference) => set({ themePreference }),
      login: async (role) => {
        set({ isLoading: true });

        try {
          const auth = await loginRequest(role);
          const bootstrap = await bootstrapRequest(auth.token);
          attachSocket(auth.token, set, get);
          set({
            ...mapBootstrap(auth.token, bootstrap),
          });
        } finally {
          set({ isLoading: false });
        }
      },
      logout: () => {
        get().socket?.disconnect();
        set({
          token: null,
          user: null,
          products: [],
          orders: [],
          metrics: EMPTY_METRICS,
          activeOrder: null,
          socket: null,
        });
      },
      placeOrder: async (productId, scheduledDate) => {
        const token = get().token;

        if (!token) {
          throw new Error("No token");
        }

        const response = await placeOrderRequest(token, { productId, scheduledDate });
        const nextOrders = upsertOrder(get().orders, response.order);
        const user = get().user;
        const activeOrder = getActiveOrder(user, nextOrders);

        set({ orders: nextOrders, activeOrder });

        return response.order;
      },
      updateOrderStatus: async (orderId, status) => {
        const token = get().token;

        if (!token) {
          throw new Error("No token");
        }

        const response = await updateOrderStatusRequest(token, orderId, status);
        const nextOrders = upsertOrder(get().orders, response.order);
        const user = get().user;
        const activeOrder = getActiveOrder(user, nextOrders);

        set({ orders: nextOrders, activeOrder });
      },
    }),
    {
      name: "avishu-ui-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        themePreference: state.themePreference,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          void i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);
