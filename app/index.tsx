import { Redirect } from "expo-router";

import { useAppStore } from "../src/store/useAppStore";

export default function IndexScreen() {
  const user = useAppStore((state) => state.user);

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (user.role === "client") {
    return <Redirect href="/client" />;
  }

  if (user.role === "franchisee") {
    return <Redirect href="/franchisee" />;
  }

  return <Redirect href="/production" />;
}
