import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { MonoButton } from "../../src/components/MonoButton";
import { Panel } from "../../src/components/Panel";
import { ProductCard } from "../../src/components/ProductCard";
import { ScreenShell } from "../../src/components/ScreenShell";
import { SectionHeading } from "../../src/components/SectionHeading";
import { StatusPill } from "../../src/components/StatusPill";
import { formatDate } from "../../src/features/client/shared";
import { useRequireRole } from "../../src/lib/useRequireRole";
import { useResolvedTheme } from "../../src/lib/theme";
import { useAppStore } from "../../src/store/useAppStore";
import { AppLanguage } from "../../src/types";

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    shellSubtitle: string;
    favoritesTitle: string;
    favoritesSubtitle: string;
    historyTitle: string;
    historySubtitle: string;
    recommendationsTitle: string;
    recommendationsSubtitle: string;
    rewardsTitle: string;
    rewardsSubtitle: string;
    notificationsTitle: string;
    notificationsSubtitle: string;
    repeatOrder: string;
    empty: string;
  }
> = {
  ru: {
    shellTitle: "Избранное",
    shellSubtitle: "SAVED / HISTORY / REPEAT ORDER / CRM",
    favoritesTitle: "Избранные позиции",
    favoritesSubtitle: "Сохраненные товары для возврата к покупке и стилизации.",
    historyTitle: "История просмотров",
    historySubtitle: "Последние product-touchpoints для recovery и персонализации.",
    recommendationsTitle: "Персональные подборки",
    recommendationsSubtitle: "Cross-sell и recovery-рекомендации на основе поведения клиента.",
    rewardsTitle: "Loyalty rewards",
    rewardsSubtitle: "Уровни, баллы и доступные premium-награды.",
    notificationsTitle: "Уведомления и повтор заказа",
    notificationsSubtitle: "Статус заказа, CRM-сигналы и быстрый repeat-order.",
    repeatOrder: "Повторить заказ",
    empty: "Пока пусто",
  },
  kk: {
    shellTitle: "Таңдалған",
    shellSubtitle: "SAVED / HISTORY / REPEAT ORDER / CRM",
    favoritesTitle: "Таңдалған позициялар",
    favoritesSubtitle: "Сатып алуға және стилизацияға қайта оралатын сақталған тауарлар.",
    historyTitle: "Қарау тарихы",
    historySubtitle: "Recovery мен personalization үшін соңғы product-touchpoints.",
    recommendationsTitle: "Жеке іріктемелер",
    recommendationsSubtitle: "Клиент әрекетіне негізделген cross-sell және recovery ұсыныстары.",
    rewardsTitle: "Loyalty rewards",
    rewardsSubtitle: "Деңгейлер, ұпайлар және premium-сыйлықтар.",
    notificationsTitle: "Хабарламалар және repeat order",
    notificationsSubtitle: "Тапсырыс күйі, CRM-сигналдар және жылдам repeat-order.",
    repeatOrder: "Тапсырысты қайталау",
    empty: "Әзірге бос",
  },
  en: {
    shellTitle: "Saved",
    shellSubtitle: "SAVED / HISTORY / REPEAT ORDER / CRM",
    favoritesTitle: "Saved favorites",
    favoritesSubtitle: "Products held for later purchase and styling return.",
    historyTitle: "View history",
    historySubtitle: "Recent product touchpoints for recovery and personalization.",
    recommendationsTitle: "Personal picks",
    recommendationsSubtitle: "Cross-sell and recovery recommendations based on client behavior.",
    rewardsTitle: "Loyalty rewards",
    rewardsSubtitle: "Tier, points and available premium benefits.",
    notificationsTitle: "Notifications and repeat order",
    notificationsSubtitle: "Order status, CRM signals and one-tap re-order.",
    repeatOrder: "Repeat order",
    empty: "Nothing here yet",
  },
};

export default function SavedScreen() {
  const redirect = useRequireRole("client");
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const products = useAppStore((state) => state.products);
  const favorites = useAppStore((state) => state.favorites);
  const productViews = useAppStore((state) => state.productViews);
  const recommendations = useAppStore((state) => state.recommendations);
  const rewards = useAppStore((state) => state.rewards);
  const notifications = useAppStore((state) => state.notifications);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const repeatOrder = useAppStore((state) => state.repeatOrder);
  const orders = useAppStore((state) => state.orders);
  const copy = COPY[language];

  if (redirect) {
    return redirect;
  }

  const favoriteProducts = favorites
    .map((favorite) => products.find((product) => product.id === favorite.productId))
    .filter(Boolean);

  const recentViewProducts = productViews
    .map((view) => products.find((product) => product.id === view.productId))
    .filter((product, index, list) => Boolean(product) && list.indexOf(product) === index)
    .slice(0, 6);

  const recommendedProducts = recommendations
    .map((recommendation) => ({
      recommendation,
      product: products.find((product) => product.id === recommendation.productId),
    }))
    .filter((entry) => Boolean(entry.product));

  const repeatableOrders = orders.filter((order) => order.status === "delivered").slice(0, 3);

  return (
    <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle} profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.section}>
          <SectionHeading title={copy.favoritesTitle} subtitle={copy.favoritesSubtitle} compact />
          <View style={styles.productGrid}>
            {favoriteProducts.length ? (
              favoriteProducts.map((product) =>
                product ? (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout="mobile"
                    onPress={() => router.push(`/client/product/${product.id}`)}
                  />
                ) : null,
              )
            ) : (
              <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>{copy.empty}</Text>
            )}
          </View>
        </Panel>

        <Panel style={styles.section}>
          <SectionHeading title={copy.historyTitle} subtitle={copy.historySubtitle} compact />
          <View style={styles.productGrid}>
            {recentViewProducts.length ? (
              recentViewProducts.map((product) =>
                product ? (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout="mobile"
                    onPress={() => router.push(`/client/product/${product.id}`)}
                  />
                ) : null,
              )
            ) : (
              <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>{copy.empty}</Text>
            )}
          </View>
        </Panel>

        <Panel style={styles.section}>
          <SectionHeading title={copy.recommendationsTitle} subtitle={copy.recommendationsSubtitle} compact />
          <View style={styles.stack}>
            {recommendedProducts.length ? (
              recommendedProducts.map(({ recommendation, product }) =>
                product ? (
                  <View
                    key={recommendation.id}
                    style={[
                      styles.infoCard,
                      {
                        borderColor: theme.colors.borderSoft,
                        backgroundColor: theme.colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <View style={styles.infoHead}>
                      <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>{recommendation.label}</Text>
                      <StatusPill label={product.categoryName} tone="ghost" />
                    </View>
                    <Text style={[styles.infoBody, { color: theme.colors.textSecondary }]}>
                      {recommendation.reason}
                    </Text>
                    <MonoButton
                      label={product.name}
                      variant="secondary"
                      onPress={() => router.push(`/client/product/${product.id}`)}
                    />
                  </View>
                ) : null,
              )
            ) : (
              <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>{copy.empty}</Text>
            )}
          </View>
        </Panel>

        <Panel style={styles.section}>
          <SectionHeading title={copy.rewardsTitle} subtitle={copy.rewardsSubtitle} compact />
          <View style={styles.stack}>
            {rewards.length ? (
              rewards.map((reward) => (
                <View
                  key={reward.id}
                  style={[
                    styles.infoCard,
                    {
                      borderColor: theme.colors.borderSoft,
                      backgroundColor: theme.colors.surfaceSecondary,
                    },
                  ]}
                >
                  <View style={styles.infoHead}>
                    <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>{reward.title}</Text>
                    <StatusPill label={`${reward.pointsRequired} PTS`} tone="solid" />
                  </View>
                  <Text style={[styles.infoBody, { color: theme.colors.textSecondary }]}>{reward.description}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>{copy.empty}</Text>
            )}
          </View>
        </Panel>

        <Panel style={styles.section}>
          <SectionHeading title={copy.notificationsTitle} subtitle={copy.notificationsSubtitle} compact />
          <View style={styles.stack}>
            {notifications.slice(0, 5).map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.infoCard,
                  {
                    borderColor: theme.colors.borderSoft,
                    backgroundColor: theme.colors.surfaceSecondary,
                  },
                ]}
              >
                <View style={styles.infoHead}>
                  <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>{notification.title}</Text>
                  {!notification.read ? (
                    <MonoButton label="Read" variant="secondary" onPress={() => markNotificationRead(notification.id)} />
                  ) : null}
                </View>
                <Text style={[styles.infoBody, { color: theme.colors.textSecondary }]}>{notification.body}</Text>
              </View>
            ))}

            {repeatableOrders.map((order) => (
              <View
                key={order.id}
                style={[
                  styles.infoCard,
                  {
                    borderColor: theme.colors.borderSoft,
                    backgroundColor: theme.colors.surfaceSecondary,
                  },
                ]}
              >
                <View style={styles.infoHead}>
                  <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>{order.productName}</Text>
                  <StatusPill label={formatDate(order.createdAt, language)} tone="ghost" />
                </View>
                <Text style={[styles.infoBody, { color: theme.colors.textSecondary }]}>
                  {order.number} / {order.totalFormatted}
                </Text>
                <MonoButton label={copy.repeatOrder} onPress={() => repeatOrder(order.id)} />
              </View>
            ))}
          </View>
        </Panel>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 24,
  },
  section: {
    gap: 14,
  },
  productGrid: {
    gap: 12,
  },
  stack: {
    gap: 12,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  infoHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  infoTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    letterSpacing: 0.7,
  },
  infoBody: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  empty: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
});
