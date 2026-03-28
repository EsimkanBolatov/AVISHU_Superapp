import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
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
    menu: string;
    close: string;
  }
> = {
  ru: {
    home: "Лендинг",
    profile: "Профиль",
    dashboard: "Кабинет",
    cart: "Корзина",
    admin: "Админ",
    live: "Живой",
    prototype: "Прототип / 2026",
    menu: "Меню",
    close: "Свернуть",
  },
  kk: {
    home: "Лендинг",
    profile: "Профиль",
    dashboard: "Кабинет",
    cart: "Себет",
    admin: "Әкімші",
    live: "Тірі",
    prototype: "Прототип / 2026",
    menu: "Мәзір",
    close: "Жинау",
  },
  en: {
    home: "Landing",
    profile: "Profile",
    dashboard: "Dashboard",
    cart: "Cart",
    admin: "Admin",
    live: "Live",
    prototype: "Prototype / 2026",
    menu: "Menu",
    close: "Collapse",
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
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    if (!isCompact) {
      setMobileExpanded(false);
      return;
    }

    setMobileExpanded(false);
  }, [isCompact, pathname]);

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

  const headerContentVisible = !isCompact || mobileExpanded;

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
          <View style={styles.topbarLead}>
            <View style={styles.brandRow}>
              <View style={styles.titleBlock}>
                <Text style={[styles.brand, isCompact && styles.brandCompact, { color: theme.colors.textPrimary }]}>
                  AVISHU
                </Text>
                <Text style={[styles.subtitle, isCompact && styles.subtitleCompact, { color: theme.colors.textMuted }]}>
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

              {isCompact ? (
                <Pressable
                  onPress={() => setMobileExpanded((current) => !current)}
                  style={[
                    styles.menuButton,
                    {
                      borderColor: theme.colors.borderSoft,
                      backgroundColor: theme.colors.surfaceSecondary,
                    },
                  ]}
                >
                  <Text style={[styles.menuLabel, { color: theme.colors.textPrimary }]}>
                    {mobileExpanded ? copy.close : copy.menu}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <Text style={[styles.metaText, isCompact && styles.metaTextCompact, { color: theme.colors.textMuted }]}>
              {copy.live} / {copy.prototype}
            </Text>
          </View>

          {headerContentVisible ? (
            <View style={[styles.topbarRight, isCompact && styles.topbarRightCompact]}>
              <View style={styles.toggleRow}>
                <LanguageSwitch compact={isCompact} />
                <ThemeSwitch compact={isCompact} />
              </View>

              {isCompact ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.shortcutRail}
                >
                  {shortcuts.map((item) => {
                    const active = pathname === item.route;

                    return (
                      <Pressable
                        key={item.key}
                        onPress={() => router.push(item.route as never)}
                        style={[
                          styles.shortcut,
                          isCompact && styles.shortcutCompact,
                          {
                            borderColor: active ? theme.colors.border : theme.colors.borderSoft,
                            backgroundColor: active
                              ? theme.colors.surfaceSecondary
                              : theme.colors.surface,
                          },
                        ]}
                      >
                        <Text style={[styles.shortcutLabel, { color: theme.colors.textPrimary }]}>
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
                </ScrollView>
              ) : (
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
                        <Text style={[styles.shortcutLabel, { color: theme.colors.textPrimary }]}>
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
              )}
            </View>
          ) : null}
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
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  topbar: {
    borderWidth: 1,
    borderRadius: 32,
    paddingHorizontal: 28, 
    paddingVertical: 24, 
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 1600,
    alignSelf: "center",
    width: "100%",
  },
  topbarCompact: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16, 
    flexDirection: "column",
    alignItems: "stretch", 
    justifyContent: "flex-start",
  },
  topbarLead: {
    gap: 8,
    flexShrink: 1,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  brand: {
    fontFamily: "Oswald_500Medium",
    fontSize: 34,
    letterSpacing: 2.4,
  },
  brandCompact: {
    fontSize: 28,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.8,
  },
  subtitleCompact: {
    fontSize: 9,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: "Oswald_500Medium",
    fontSize: 58,
    lineHeight: 62,
    letterSpacing: 1.6,
  },
  titleCompact: {
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: 0.7,
  },
  metaText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
    alignSelf: "flex-end",
  },
  metaTextCompact: {
    alignSelf: "flex-start",
    fontSize: 9,
    letterSpacing: 1.2,
  },
  menuButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 88,
    alignItems: "center",
  },
  menuLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.3,
  },
  topbarRight: {
    gap: 16, 
    alignItems: "flex-end",
    justifyContent: "center",
  },
  topbarRightCompact: {
    alignItems: "stretch",
    gap: 10,
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
  },
  shortcutRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-end",
  },
  shortcutRail: {
    gap: 8,
    paddingRight: 8,
  },
  shortcut: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  shortcutCompact: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  shortcutLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
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
