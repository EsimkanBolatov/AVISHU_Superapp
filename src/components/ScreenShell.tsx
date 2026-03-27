import { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useResolvedTheme } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { Role } from "../types";

const ROLE_ROUTES: Record<Role, string> = {
  client: "/client",
  franchisee: "/franchisee",
  production: "/production",
};

export function ScreenShell({
  children,
  title,
  subtitle,
  profileRoute,
}: PropsWithChildren<{
  title: string;
  subtitle: string;
  profileRoute?: string;
}>) {
  const theme = useResolvedTheme();
  const pathname = usePathname();
  const user = useAppStore((state) => state.user);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <View
          style={[
            styles.topbar,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <View style={styles.brandBlock}>
            <Text style={[styles.brand, { color: theme.colors.textPrimary }]}>AVISHU</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {title} / {subtitle}
            </Text>
          </View>

          <View style={styles.nav}>
            {(["client", "franchisee", "production"] as const).map((role) => (
              <Pressable
                key={role}
                onPress={() => router.push(ROLE_ROUTES[role])}
                style={[
                  styles.navItem,
                  pathname.startsWith(ROLE_ROUTES[role]) && {
                    backgroundColor: theme.colors.textPrimary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.navText,
                    {
                      color:
                        pathname.startsWith(ROLE_ROUTES[role])
                          ? theme.colors.background
                          : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {role.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => router.push(profileRoute ?? "/profile")}
            style={[styles.profile, { borderColor: theme.colors.border }]}
          >
            <Text style={[styles.profileLabel, { color: theme.colors.textPrimary }]}>
              {user?.name ?? "GUEST"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  topbar: {
    borderWidth: 1,
    minHeight: 84,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandBlock: {
    gap: 2,
  },
  brand: {
    fontFamily: "Oswald_500Medium",
    fontSize: 26,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  nav: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  navItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  navText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
  },
  profile: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  profileLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  content: {
    flex: 1,
    paddingTop: 18,
  },
});
