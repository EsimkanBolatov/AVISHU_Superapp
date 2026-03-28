import {
  AuthPayload,
  BootstrapPayload,
  ContentEntryUpsertPayload,
  CreateTryOnPayload,
  LoginResponse,
  OrderStatus,
  PlaceOrderPayload,
  ProductUpsertPayload,
  RegisterPayload,
  SavedAddressPayload,
  SavedPaymentCardPayload,
  UpdateOrderWorkflowPayload,
  UpdateProfilePayload,
} from "../types";

const CORE_API_URL = process.env.EXPO_PUBLIC_CORE_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${CORE_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message ?? `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function registerRequest(payload: RegisterPayload) {
  return request<LoginResponse>("/api/core/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginRequest(payload: AuthPayload) {
  return request<LoginResponse>("/api/core/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutRequest(token: string) {
  return request<void>("/api/core/v1/auth/logout", {
    method: "POST",
    headers: authHeaders(token),
  });
}

export async function sessionRequest(token: string) {
  return request<{ user: BootstrapPayload["user"] }>("/api/core/v1/auth/session", {
    headers: authHeaders(token),
  });
}

export async function updateProfileRequest(token: string, payload: UpdateProfilePayload) {
  return request<{ user: BootstrapPayload["user"] }>("/api/core/v1/profile", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function createAddressRequest(token: string, payload: SavedAddressPayload) {
  return request<{ address: BootstrapPayload["savedAddresses"][number]; user: BootstrapPayload["user"] }>(
    "/api/core/v1/profile/addresses",
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    },
  );
}

export async function updateAddressRequest(
  token: string,
  addressId: string,
  payload: SavedAddressPayload,
) {
  return request<{ address: BootstrapPayload["savedAddresses"][number]; user: BootstrapPayload["user"] }>(
    `/api/core/v1/profile/addresses/${addressId}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteAddressRequest(token: string, addressId: string) {
  return request<void>(`/api/core/v1/profile/addresses/${addressId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function createCardRequest(token: string, payload: SavedPaymentCardPayload) {
  return request<{ card: BootstrapPayload["savedCards"][number]; user: BootstrapPayload["user"] }>(
    "/api/core/v1/profile/cards",
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    },
  );
}

export async function updateCardRequest(
  token: string,
  cardId: string,
  payload: SavedPaymentCardPayload,
) {
  return request<{ card: BootstrapPayload["savedCards"][number]; user: BootstrapPayload["user"] }>(
    `/api/core/v1/profile/cards/${cardId}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteCardRequest(token: string, cardId: string) {
  return request<void>(`/api/core/v1/profile/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function bootstrapRequest(token: string) {
  return request<BootstrapPayload>("/api/core/v1/bootstrap", {
    headers: authHeaders(token),
  });
}

export async function createTryOnRequest(token: string, payload: CreateTryOnPayload) {
  return request<{ tryOn: BootstrapPayload["tryOnSessions"][number] }>("/api/core/v1/try-ons", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function placeOrderRequest(token: string, payload: PlaceOrderPayload) {
  return request<{ order: BootstrapPayload["orders"][number] }>("/api/core/v1/orders", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatusRequest(token: string, orderId: string, status: OrderStatus) {
  return request<{ order: BootstrapPayload["orders"][number] }>(`/api/core/v1/orders/${orderId}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
}

export async function updateOrderWorkflowRequest(
  token: string,
  orderId: string,
  payload: UpdateOrderWorkflowPayload,
) {
  return request<{ order: BootstrapPayload["orders"][number] }>(
    `/api/core/v1/orders/${orderId}/workflow`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    },
  );
}

export async function addOrderCommentRequest(token: string, orderId: string, message: string) {
  return request<{ order: BootstrapPayload["orders"][number] }>(`/api/core/v1/orders/${orderId}/comments`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ message }),
  });
}

export async function addOrderAttachmentRequest(
  token: string,
  orderId: string,
  payload: { label: string; url: string },
) {
  return request<{ order: BootstrapPayload["orders"][number] }>(
    `/api/core/v1/orders/${orderId}/attachments`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    },
  );
}

export async function trackProductViewRequest(token: string, productId: string) {
  return request<{ view: BootstrapPayload["productViews"][number] }>(
    `/api/core/v1/client/products/${productId}/view`,
    {
      method: "POST",
      headers: authHeaders(token),
    },
  );
}

export async function createFavoriteRequest(token: string, productId: string) {
  return request<{ favorite: BootstrapPayload["favorites"][number]; active: boolean }>(
    `/api/core/v1/client/favorites/${productId}`,
    {
      method: "POST",
      headers: authHeaders(token),
    },
  );
}

export async function deleteFavoriteRequest(token: string, productId: string) {
  return request<void>(`/api/core/v1/client/favorites/${productId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function markNotificationReadRequest(token: string, notificationId: string) {
  return request<{ notification: BootstrapPayload["notifications"][number] }>(
    `/api/core/v1/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: authHeaders(token),
    },
  );
}

export async function createProductRequest(token: string, payload: ProductUpsertPayload) {
  return request<{ product: BootstrapPayload["products"][number] }>("/api/core/v1/admin/products", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateProductRequest(
  token: string,
  productId: string,
  payload: Partial<ProductUpsertPayload>,
) {
  return request<{ product: BootstrapPayload["products"][number] }>(
    `/api/core/v1/admin/products/${productId}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteProductRequest(token: string, productId: string) {
  return request<void>(`/api/core/v1/admin/products/${productId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function createContentRequest(token: string, payload: ContentEntryUpsertPayload) {
  return request<{ contentEntry: BootstrapPayload["contentEntries"][number] }>("/api/core/v1/admin/content", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateContentRequest(
  token: string,
  contentId: string,
  payload: Partial<ContentEntryUpsertPayload>,
) {
  return request<{ contentEntry: BootstrapPayload["contentEntries"][number] }>(
    `/api/core/v1/admin/content/${contentId}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteContentRequest(token: string, contentId: string) {
  return request<void>(`/api/core/v1/admin/content/${contentId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function publicContentRequest(locale: string, kind?: string) {
  const params = new URLSearchParams({ locale });

  if (kind) {
    params.set("kind", kind);
  }

  return request<{ contentEntries: BootstrapPayload["contentEntries"] }>(`/api/core/v1/content?${params.toString()}`);
}

export { CORE_API_URL };
