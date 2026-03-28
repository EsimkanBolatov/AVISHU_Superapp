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

const SHELL_MAX_WIDTH = 1880;

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
    collapse: string;
    expand: string;
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
    collapse: "Свернуть",
    expand: "Развернуть",
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
    collapse: "Жинау",
    expand: "Жаю",
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
    collapse: "Collapse",
    expand: "Expand",
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
  const desktopHeaderCollapsed = useAppStore((state) => state.desktopHeaderCollapsed);
  const setDesktopHeaderCollapsed = useAppStore((state) => state.setDesktopHeaderCollapsed);
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

  const headerContentVisible = isCompact ? mobileExpanded : !desktopHeaderCollapsed;

  function handleHeaderToggle() {
    if (isCompact) {
      setMobileExpanded((current) => !current);
      return;
    }

    setDesktopHeaderCollapsed(!desktopHeaderCollapsed);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.frame, isCompact && styles.frameCompact]}>
        <View style={styles.viewport}>
          <View
            style={[
              styles.topbar,
              isCompact && styles.topbarCompact,
              !isCompact && desktopHeaderCollapsed && styles.topbarCollapsed,
              {
                borderColor: theme.colors.borderSoft,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            {/* ЛЕВЫЙ БЛОК: Заголовки */}
            <View
              style={[
                styles.topbarLead,
                !isCompact && styles.topbarLeadDesktop, // flex: 1 применяем ТОЛЬКО на десктопе
                !isCompact && desktopHeaderCollapsed && styles.topbarLeadCollapsed,
              ]}
            >
              <View style={styles.brandRow}>
                <View style={styles.titleBlock}>
                  <Text
                    style={[styles.brand, isCompact && styles.brandCompact, { color: theme.colors.textPrimary }]}
                  >
                    AVISHU
                  </Text>
                  <Text
                    style={[
                      styles.subtitle,
                      isCompact && styles.subtitleCompact,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    {subtitle}
                  </Text>
                  <Text
                    style={[
                      styles.title,
                      isCompact && styles.titleCompact,
                      !isCompact && desktopHeaderCollapsed && styles.titleCollapsed,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {title}
                  </Text>
                </View>

                {/* Кнопка меню только для МОБИЛЬНОЙ версии */}
                {isCompact && (
                  <Pressable
                    onPress={handleHeaderToggle}
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
                )}
              </View>
            </View>

            {/* ПРАВЫЙ БЛОК: Кнопка десктопа + Тулбары */}
            {(!isCompact || headerContentVisible) ? (
              <View style={[styles.topbarRight, isCompact && styles.topbarRightCompact]}>
                
                {/* Кнопка меню только для ДЕСКТОПНОЙ версии */}
                {!isCompact && (
                  <Pressable
                    onPress={handleHeaderToggle}
                    style={[
                      styles.menuButton,
                      styles.menuButtonDesktop,
                      {
                        borderColor: theme.colors.borderSoft,
                        backgroundColor: theme.colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Text style={[styles.menuLabel, { color: theme.colors.textPrimary }]}>
                      {desktopHeaderCollapsed ? copy.expand : copy.collapse}
                    </Text>
                  </Pressable>
                )}

                {/* Переключатели и шорткаты показываем только если блок раскрыт */}
                {headerContentVisible ? (
                  <>
                    <View style={[styles.toggleRow, isCompact && styles.toggleRowCompact]}>
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
                                styles.shortcutCompact,
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
                                <View style={[styles.count, { backgroundColor: theme.colors.accent }]}>
                                  <Text style={[styles.countLabel, { color: theme.colors.accentContrast }]}>
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
                                <View style={[styles.count, { backgroundColor: theme.colors.accent }]}>
                                  <Text style={[styles.countLabel, { color: theme.colors.accentContrast }]}>
                                    {item.count}
                                  </Text>
                                </View>
                              ) : null}
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  frame: { flex: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 22 },
  frameCompact: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },
  viewport: { flex: 1, width: "100%", maxWidth: SHELL_MAX_WIDTH, alignSelf: "center", gap: 18 },
  topbar: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
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
  topbarCollapsed: { paddingHorizontal: 24, paddingVertical: 16, gap: 12 },
  
  // ИСПРАВЛЕНИЕ ЗДЕСЬ: Убрали flex: 1 из базового стиля
  topbarLead: { gap: 8 }, 
  // И вынесли его в отдельный стиль для десктопа
  topbarLeadDesktop: { flexShrink: 1, flex: 1 },
  
  topbarLeadCollapsed: { gap: 4 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "flex-start" },
  titleBlock: { flex: 1, minWidth: 0, gap: 4 },
  brand: { fontFamily: "Oswald_500Medium", fontSize: 34, letterSpacing: 2.4 },
  brandCompact: { fontSize: 28, letterSpacing: 2 },
  subtitle: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1.8 },
  subtitleCompact: { fontSize: 9, letterSpacing: 1.2 },
  title: { fontFamily: "Oswald_500Medium", fontSize: 58, lineHeight: 62, letterSpacing: 1.6 },
  titleCompact: { fontSize: 30, lineHeight: 32, letterSpacing: 0.7 },
  titleCollapsed: { fontSize: 36, lineHeight: 40, letterSpacing: 1 },
  menuButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, minWidth: 88, alignItems: "center" },
  menuButtonDesktop: { minWidth: 118, paddingHorizontal: 14 },
  menuLabel: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1.3 },
  topbarRight: { gap: 16, alignItems: "flex-end", justifyContent: "center", flexShrink: 0 },
  topbarRightCompact: { alignItems: "stretch", gap: 12 },
  toggleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" },
  // НОВОЕ: Растягиваем переключатели на мобилке
  toggleRowCompact: { justifyContent: "space-between" }, 
  shortcutRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "flex-end" },
  shortcutRail: { gap: 8, paddingRight: 8 },
  shortcut: { minHeight: 44, borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 10 },
  shortcutCompact: { minHeight: 40, paddingHorizontal: 14, paddingVertical: 9 },
  shortcutLabel: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1.4 },
  count: { minWidth: 22, height: 22, borderRadius: 999, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  countLabel: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1 },
  content: { flex: 1, width: "100%", minHeight: 0 },
});