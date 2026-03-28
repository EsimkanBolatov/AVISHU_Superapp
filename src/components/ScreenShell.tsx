import { PropsWithChildren, useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";

import { LanguageSwitch } from "./LanguageSwitch";
import { ThemeSwitch } from "./ThemeSwitch";
import { useResolvedTheme } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { AppLanguage, Role } from "../types";

const COPY: Record<
  AppLanguage,
  {
    home: string;
    profile: string;
    dashboard: string;
    cart: string;
    admin: string;
    live: string;
    prototype: string;
  }
> = {
  ru: {
    home: "ЛЕНДИНГ",
    profile: "ПРОФИЛЬ",
    dashboard: "КАБИНЕТ",
    cart: "КОРЗИНА",
    admin: "АДМИН",
    live: "ЖИВОЙ",
    prototype: "ПРОТОТИП / 2026",
  },
  kk: {
    home: "ЛЕНДИНГ",
    profile: "ПРОФИЛЬ",
    dashboard: "КАБИНЕТ",
    cart: "СЕБЕТ",
    admin: "ӘКІМШІ",
    live: "ТІРІ",
    prototype: "ПРОТОТИП / 2026",
  },
  en: {
    home: "LANDING",
    profile: "PROFILE",
    dashboard: "DASHBOARD",
    cart: "CART",
    admin: "ADMIN",
    live: "LIVE",
    prototype: "PROTOTYPE / 2026",
  },
};

function getRoleRoute(role?: Role | null) {
  if (!role) {
    return "/login";
  }

  if (role === "client") {
    return "/client";
  }

  if (role === "admin") {
    return "/admin";
  }

  if (role === "franchisee") {
    return "/franchisee";
  }

  return "/production";
}

export function ScreenShell({
  children,
  title,
  subtitle,
  profileRoute = "/profile",
}: PropsWithChildren<{
  title: string;
  subtitle: string;
  profileRoute?: string;
}>) {
  const theme = useResolvedTheme();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const language = useAppStore((state) => state.language);
  const user = useAppStore((state) => state.user);
  const cartItems = useAppStore((state) => state.cartItems);
  const copy = COPY[language];
  const isCompact = width < 760;

  const shortcuts = useMemo(() => {
    const items: Array<{ key: string; label: string; route: string; count?: number }> = [
      {
        key: "home",
        label: copy.home,
        route: "/",
      },
    ];

    if (user) {
      items.push({
        key: "dashboard",
        label: copy.dashboard,
        route: getRoleRoute(user.role),
      });

      if (profileRoute) {
        items.push({
          key: "profile",
          label: copy.profile,
          route: profileRoute,
        });
      }

      if (user.role === "client") {
        items.push({
          key: "cart",
          label: copy.cart,
          route: "/client/cart",
          count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        });
      }

      if (user.role === "admin" && Platform.OS === "web") {
        items.push({
          key: "admin",
          label: copy.admin,
          route: "/admin",
        });
      }
    }

    return items;
  }, [copy.admin, copy.cart, copy.dashboard, copy.home, copy.profile, profileRoute, user, cartItems]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.frame, isCompact && styles.frameCompact]}>
        <View
          style={[
            styles.topbar,
            isCompact && styles.topbarCompact,
            {
              borderColor: theme.colors.borderSoft,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <View style={styles.titleBlock}>
            <Text style={[styles.brand, { color: theme.colors.textPrimary }]}>AVISHU</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {subtitle}
            </Text>
            <Text
              style={[
                styles.title,
                isCompact && styles.titleCompact,
                { color: theme.colors.textPrimary },
              ]}
            >
              {title}
            </Text>
          </View>

          <View style={styles.topbarRight}>
            <View style={styles.metaRow}>
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                {copy.live} / {copy.prototype}
              </Text>
            </View>

            <View style={styles.toggleRow}>
              <LanguageSwitch />
              <ThemeSwitch />
            </View>

            <View style={styles.shortcutRow}>
              {shortcuts.map((item) => {
                const active = pathname === item.route;

                return (
                  <Pressable
                    key={item.key}
                    onPress={() => router.push(item.route as never)}
                    style={[
                      styles.shortcut,
                      {
                        borderColor: active ? theme.colors.border : theme.colors.borderSoft,
                        backgroundColor: active
                          ? theme.colors.surfaceSecondary
                          : theme.colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.shortcutLabel,
                        {
                          color: theme.colors.textPrimary,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.count ? (
                      <View
                        style={[
                          styles.count,
                          {
                            backgroundColor: theme.colors.accent,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.countLabel,
                            {
                              color: theme.colors.accentContrast,
                            },
                          ]}
                        >
                          {item.count}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
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
  frame: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    gap: 18,
  },
  frameCompact: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 14,
  },
  topbar: {
    borderWidth: 1,
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "flex-start",
  },
  topbarCompact: {
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  titleBlock: {
    flex: 1,
    minWidth: 280,
    gap: 6,
  },
  brand: {
    fontFamily: "Oswald_500Medium",
    fontSize: 34,
    letterSpacing: 2.4,
  },
  subtitle: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.9,
  },
  title: {
    fontFamily: "Oswald_500Medium",
    fontSize: 58,
    lineHeight: 62,
    letterSpacing: 1.6,
  },
  titleCompact: {
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: 1.1,
  },
  topbarRight: {
    flex: 1,
    minWidth: 320,
    gap: 12,
    alignItems: "flex-end",
  },
  metaRow: {
    minHeight: 22,
    justifyContent: "center",
  },
  metaText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.7,
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-end",
  },
  shortcutRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-end",
  },
  shortcut: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  shortcutLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  count: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
});
