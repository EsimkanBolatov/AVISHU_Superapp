import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    dashboard: string;
    profile: string;
    cart: string;
    saved: string;
    admin: string;
    support: string;
    live: string;
    prototype: string;
    menu: string;
    close: string;
    collapse: string;
    expand: string;
    networkTitle: string;
    networkBody: string;
    dismiss: string;
  }
> = {
  ru: {
    home: "Лендинг",
    dashboard: "Кабинет",
    profile: "Профиль",
    cart: "Корзина",
    saved: "Избранное",
    admin: "Админ",
    support: "Support",
    live: "Живой",
    prototype: "Прототип / 2026",
    menu: "Меню",
    close: "Свернуть",
    collapse: "Свернуть",
    expand: "Развернуть",
    networkTitle: "Сетевое состояние",
    networkBody: "Некоторые данные могут быть неактуальны. Последний запрос завершился ошибкой.",
    dismiss: "Скрыть",
  },
  kk: {
    home: "Лендинг",
    dashboard: "Кабинет",
    profile: "Профиль",
    cart: "Себет",
    saved: "Таңдалған",
    admin: "Әкімші",
    support: "Support",
    live: "Тірі",
    prototype: "Прототип / 2026",
    menu: "Мәзір",
    close: "Жинау",
    collapse: "Жинау",
    expand: "Ашу",
    networkTitle: "Желі күйі",
    networkBody: "Кейбір деректер ескі болуы мүмкін. Соңғы сұрау қате аяқталды.",
    dismiss: "Жасыру",
  },
  en: {
    home: "Landing",
    dashboard: "Workspace",
    profile: "Profile",
    cart: "Cart",
    saved: "Saved",
    admin: "Admin",
    support: "Support",
    live: "Live",
    prototype: "Prototype / 2026",
    menu: "Menu",
    close: "Close",
    collapse: "Collapse",
    expand: "Expand",
    networkTitle: "Network state",
    networkBody: "Some data may be stale. The last request did not complete successfully.",
    dismiss: "Dismiss",
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

  if (role === "support") {
    return "/support";
  }

  return "/production";
}

function isPathActive(pathname: string, target: string) {
  if (pathname === target) {
    return true;
  }

  return pathname.startsWith(`${target}/`);
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
  const insets = useSafeAreaInsets();
  const language = useAppStore((state) => state.language);
  const user = useAppStore((state) => state.user);
  const cartItems = useAppStore((state) => state.cartItems);
  const favorites = useAppStore((state) => state.favorites);
  const desktopHeaderCollapsed = useAppStore((state) => state.desktopHeaderCollapsed);
  const setDesktopHeaderCollapsed = useAppStore((state) => state.setDesktopHeaderCollapsed);
  const isOffline = useAppStore((state) => state.isOffline);
  const lastError = useAppStore((state) => state.lastError);
  const clearError = useAppStore((state) => state.clearError);
  const copy = COPY[language];
  const isCompact = width < 760;
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    setMobileExpanded(false);
  }, [pathname]);

  const shortcuts = useMemo(() => {
    const items: Array<{ key: string; label: string; route: string; count?: number }> = [
      { key: "home", label: copy.home, route: "/" },
    ];

    if (user) {
      items.push({
        key: "dashboard",
        label: user.role === "admin" ? copy.admin : user.role === "support" ? copy.support : copy.dashboard,
        route: getRoleRoute(user.role),
      });

      if (user.role === "client") {
          items.push({
          key: "saved",
          label: copy.saved,
          route: "/client/saved",
          count: favorites.length || undefined,
        });
      }

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
          count: cartItems.reduce((sum, item) => sum + item.quantity, 0) || undefined,
        });
      }
    }

    return items;
  }, [copy.admin, copy.cart, copy.dashboard, copy.home, copy.profile, copy.saved, copy.support, profileRoute, user, cartItems, favorites.length]);

  const bottomNavItems = useMemo(
    () =>
      user?.role === "client"
        ? [
            { key: "catalog", label: copy.dashboard, route: "/client" },
            { key: "saved", label: copy.saved, route: "/client/saved" },
            { key: "cart", label: copy.cart, route: "/client/cart", count: cartItems.reduce((sum, item) => sum + item.quantity, 0) || undefined },
            { key: "profile", label: copy.profile, route: profileRoute },
          ]
        : [],
    [user?.role, copy.dashboard, copy.saved, copy.cart, copy.profile, cartItems, profileRoute],
  );

  const headerContentVisible = isCompact ? mobileExpanded : !desktopHeaderCollapsed;

  function handleHeaderToggle() {
    if (isCompact) {
      setMobileExpanded((current) => !current);
      return;
    }

    setDesktopHeaderCollapsed(!desktopHeaderCollapsed);
  }

  return (
    <View style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View 
        style={[
          styles.frame, 
          isCompact && styles.frameCompact,
          { paddingTop: Math.max(insets.top, 16), paddingBottom: 0 }
        ]}
      >
        <View style={styles.viewport}>
          <View
            style={[
              styles.topbar,
              isCompact && styles.topbarCompact,
              !isCompact && desktopHeaderCollapsed && styles.topbarCollapsed,
              {
                // Убрали borderColor, оставили только фон
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <View style={[styles.topbarLead, !isCompact && styles.topbarLeadDesktop]}>
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
                      !isCompact && desktopHeaderCollapsed && styles.titleCollapsed,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {title}
                  </Text>
                  <Text style={[styles.liveLine, { color: theme.colors.textMuted }]}>
                    {copy.live} / {copy.prototype}
                  </Text>
                </View>

                {isCompact ? (
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
                ) : null}
              </View>
            </View>

            {(!isCompact || headerContentVisible) ? (
              <View style={[styles.topbarRight, isCompact && styles.topbarRightCompact]}>
                {!isCompact ? (
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
                ) : null}

                {headerContentVisible ? (
                  <>
                    <View style={[styles.toggleRow, isCompact && styles.toggleRowCompact]}>
                      <LanguageSwitch compact={isCompact} />
                      <ThemeSwitch compact={isCompact} />
                    </View>

                    {isCompact ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcutRail}>
                        {shortcuts.map((item) => {
                          const active = isPathActive(pathname, item.route);
                          return (
                            <Pressable
                              key={item.key}
                              onPress={() => router.push(item.route as never)}
                              style={[
                                styles.shortcut,
                                styles.shortcutCompact,
                                {
                                  borderColor: active ? theme.colors.border : theme.colors.borderSoft,
                                  backgroundColor: active ? theme.colors.surfaceSecondary : theme.colors.surface,
                                },
                              ]}
                            >
                              <Text style={[styles.shortcutLabel, { color: theme.colors.textPrimary }]}>{item.label}</Text>
                              {item.count ? (
                                <View style={[styles.count, { backgroundColor: theme.colors.accent }]}>
                                  <Text style={[styles.countLabel, { color: theme.colors.accentContrast }]}>{item.count}</Text>
                                </View>
                              ) : null}
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    ) : (
                      <View style={styles.shortcutRow}>
                        {shortcuts.map((item) => {
                          const active = isPathActive(pathname, item.route);
                          return (
                            <Pressable
                              key={item.key}
                              onPress={() => router.push(item.route as never)}
                              style={[
                                styles.shortcut,
                                {
                                  borderColor: active ? theme.colors.border : theme.colors.borderSoft,
                                  backgroundColor: active ? theme.colors.surfaceSecondary : theme.colors.surface,
                                },
                              ]}
                            >
                              <Text style={[styles.shortcutLabel, { color: theme.colors.textPrimary }]}>{item.label}</Text>
                              {item.count ? (
                                <View style={[styles.count, { backgroundColor: theme.colors.accent }]}>
                                  <Text style={[styles.countLabel, { color: theme.colors.accentContrast }]}>{item.count}</Text>
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

          {lastError ? (
            <View
              style={[
                styles.networkBanner,
                {
                  borderColor: theme.colors.borderSoft,
                  backgroundColor: theme.colors.surfaceSecondary,
                },
              ]}
            >
              <View style={styles.networkCopy}>
                <Text style={[styles.networkTitle, { color: theme.colors.textPrimary }]}>
                  {copy.networkTitle}
                </Text>
                <Text style={[styles.networkBody, { color: theme.colors.textSecondary }]}>
                  {isOffline ? copy.networkBody : lastError}
                </Text>
              </View>
              <Pressable
                onPress={clearError}
                style={[styles.dismissButton, { borderColor: theme.colors.borderSoft }]}
              >
                <Text style={[styles.dismissLabel, { color: theme.colors.textPrimary }]}>{copy.dismiss}</Text>
              </Pressable>
            </View>
          ) : null}
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>

      {isCompact && bottomNavItems.length > 0 ? (
        <View
          style={[
            styles.bottomNav,
            {
              // Убрали borderColor, оставили только фон
              backgroundColor: theme.colors.surface,
              bottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          {bottomNavItems.map((item) => {
            const active = isPathActive(pathname, item.route);
            return (
              <Pressable
                key={item.key}
                onPress={() => router.push(item.route as never)}
                style={[
                  styles.bottomNavItem,
                  {
                    borderColor: active ? theme.colors.border : theme.colors.borderSoft,
                    backgroundColor: active ? theme.colors.surfaceSecondary : theme.colors.surface,
                  },
                ]}
              >
                <Text style={[styles.bottomNavLabel, { color: theme.colors.textPrimary }]}>{item.label}</Text>
                {item.count ? (
                  <View style={[styles.bottomNavCount, { backgroundColor: theme.colors.accent }]}>
                    <Text style={[styles.countLabel, { color: theme.colors.accentContrast }]}>{item.count}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  frame: { flex: 1, paddingHorizontal: 20 },
  frameCompact: { paddingHorizontal: 12 },
  viewport: { flex: 1, width: "100%", maxWidth: SHELL_MAX_WIDTH, alignSelf: "center", gap: 18 },
  topbar: {
    width: "100%",
    // Убрали borderWidth: 1
    borderRadius: 32,
    paddingHorizontal: 24, 
    paddingVertical: 20,   
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12, 
  },
  topbarCompact: {
    borderRadius: 28, 
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8, 
  },
  topbarCollapsed: { paddingHorizontal: 24, paddingVertical: 16, gap: 12 },
  topbarLead: { gap: 8 },
  topbarLeadDesktop: { flexShrink: 1, flex: 1 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "flex-start" },
  titleBlock: { flex: 1, minWidth: 0, gap: 4 },
  brand: { fontFamily: "Oswald_500Medium", fontSize: 34, letterSpacing: 2.4 },
  brandCompact: { fontSize: 28, letterSpacing: 2 },
  subtitle: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1.8 },
  subtitleCompact: { fontSize: 9, letterSpacing: 1.2 },
  title: { fontFamily: "Oswald_500Medium", fontSize: 58, lineHeight: 62, letterSpacing: 1.6 },
  titleCompact: { fontSize: 30, lineHeight: 32, letterSpacing: 0.7 },
  titleCollapsed: { fontSize: 36, lineHeight: 40, letterSpacing: 1 },
  liveLine: { fontFamily: "SpaceGrotesk_500Medium", fontSize: 11, letterSpacing: 1.3, marginTop: 2 },
  menuButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, minWidth: 88, alignItems: "center" },
  menuButtonDesktop: { minWidth: 118, paddingHorizontal: 14 },
  menuLabel: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1.3 },
  topbarRight: { gap: 16, alignItems: "flex-end", justifyContent: "center", flexShrink: 0 },
  topbarRightCompact: { alignItems: "stretch", gap: 12 },
  toggleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" },
  toggleRowCompact: { justifyContent: "space-between" },
  shortcutRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "flex-end" },
  shortcutRail: { gap: 8, paddingRight: 8 },
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
  shortcutCompact: { minHeight: 40, paddingHorizontal: 14, paddingVertical: 9 },
  shortcutLabel: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1.4 },
  count: { minWidth: 22, height: 22, borderRadius: 999, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  countLabel: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1 },
  networkBanner: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  networkCopy: { flex: 1, gap: 4 },
  networkTitle: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 11, letterSpacing: 1.2 },
  networkBody: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 13, lineHeight: 20 },
  dismissButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10 },
  dismissLabel: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1.2 },
  content: { flex: 1, width: "100%", minHeight: 0 },
  contentWithBottomNav: {},
  bottomNav: {
    position: "absolute",
    left: 16, 
    right: 16,
    // Убрали borderWidth: 1
    borderRadius: 32, 
    padding: 8,
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10, 
  },
  bottomNavItem: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 24, 
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  bottomNavLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.1,
  },
  bottomNavCount: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
});