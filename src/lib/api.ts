import { BootstrapPayload, OrderStatus, Role } from "../types";

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
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function loginRequest(role: Role) {
  return request<{ token: string; user: BootstrapPayload["user"] }>("/api/core/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

export async function bootstrapRequest(token: string) {
  return request<BootstrapPayload>("/api/core/v1/bootstrap", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function placeOrderRequest(
  token: string,
  payload: { productId: string; scheduledDate?: string },
) {
  return request<{ order: BootstrapPayload["orders"][number] }>("/api/core/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatusRequest(
  token: string,
  orderId: string,
  status: OrderStatus,
) {
  return request<{ order: BootstrapPayload["orders"][number] }>(
    `/api/core/v1/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    },
  );
}

export { CORE_API_URL };
