import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { MonoButton } from "../../src/components/MonoButton";
import { OrderTracker } from "../../src/components/OrderTracker";
import { Panel } from "../../src/components/Panel";
import { ProductCard } from "../../src/components/ProductCard";
import { ScreenShell } from "../../src/components/ScreenShell";
import { SectionHeading } from "../../src/components/SectionHeading";
import { StatusPill } from "../../src/components/StatusPill";
import { useResolvedTheme } from "../../src/lib/theme";
import { useRequireRole } from "../../src/lib/useRequireRole";
import { useAppStore } from "../../src/store/useAppStore";

export default function ClientScreen() {
  const redirect = useRequireRole("client");
  const theme = useResolvedTheme();
  const products = useAppStore((state) => state.products);
  const activeOrder = useAppStore((state) => state.activeOrder);
  const user = useAppStore((state) => state.user);

  if (redirect) {
    return redirect;
  }

  return (
    <ScreenShell title="VITRINA" subtitle="КОЛЛЕКЦИЯ И ЗАКАЗЫ" profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.heroPanel}>
          <View style={styles.heroCopy}>
            <StatusPill label="DROP 03 / MONOCHROME" tone="solid" />
            <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
              BLACK TAILORING WITH EDITORIAL RHYTHM
            </Text>
            <Text style={[styles.heroText, { color: theme.colors.textSecondary }]}>
              Каталог строится на контрасте черного, белого и воздуха. Каждый продукт
              поддерживает быструю покупку или предзаказ с фиксацией даты.
            </Text>
            <View style={styles.heroActions}>
              <MonoButton
                label="ОТКРЫТЬ ПРОФИЛЬ"
                variant="secondary"
                onPress={() => router.push("/profile")}
              />
              <MonoButton
                label="СМОТРЕТЬ КАТАЛОГ"
                onPress={() => router.push("/client/product/p-001")}
              />
            </View>
          </View>
          <View style={styles.heroStatGrid}>
            <View style={[styles.heroStat, { borderColor: theme.colors.border }]}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {user?.loyaltyProgress ?? 0}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                LOYALTY STATUS
              </Text>
            </View>
            <View style={[styles.heroStat, { borderColor: theme.colors.border }]}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>LIVE</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                SOCKET SYNC
              </Text>
            </View>
            <View style={[styles.heroStat, { borderColor: theme.colors.border }]}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {products.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                PRODUCTS
              </Text>
            </View>
          </View>
        </Panel>

        {activeOrder ? (
          <Panel>
            <SectionHeading
              title="ACTIVE ORDER"
              subtitle="Статус обновляется в реальном времени без перезагрузки."
              compact
            />
            <OrderTracker order={activeOrder} />
          </Panel>
        ) : null}

        <SectionHeading
          title="CATALOG"
          subtitle="Минималистичная сетка товара с двумя сценариями: купить сразу или оформить предзаказ."
        />
        <View style={styles.catalogGrid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => router.push(`/client/product/${product.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 24,
  },
  heroPanel: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    alignItems: "stretch",
  },
  heroCopy: {
    flex: 2,
    minWidth: 280,
    gap: 14,
  },
  heroTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: 1.2,
  },
  heroText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 640,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 8,
  },
  heroStatGrid: {
    flex: 1,
    minWidth: 220,
    gap: 10,
  },
  heroStat: {
    flex: 1,
    borderWidth: 1,
    padding: 18,
    justifyContent: "space-between",
    minHeight: 94,
  },
  statValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 30,
    letterSpacing: 1.2,
  },
  statLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.6,
  },
  catalogGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
});
