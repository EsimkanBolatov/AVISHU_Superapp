import { Redirect } from "expo-router";

import { useAppStore } from "../store/useAppStore";
import { Role } from "../types";

export function useRequireRole(role: Role) {
  const user = useAppStore((state) => state.user);

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (user.role !== role) {
    return <Redirect href="/" />;
  }

  return null;
}
