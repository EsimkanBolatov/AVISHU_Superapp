import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { MonoButton } from "../../../src/components/MonoButton";
import { Panel } from "../../../src/components/Panel";
import { ScreenShell } from "../../../src/components/ScreenShell";
import { SectionHeading } from "../../../src/components/SectionHeading";
import { StatusPill } from "../../../src/components/StatusPill";
import { useResolvedTheme } from "../../../src/lib/theme";
import { useRequireRole } from "../../../src/lib/useRequireRole";
import { useAppStore } from "../../../src/store/useAppStore";

const DELIVERY_OPTIONS = ["2026-04-02", "2026-04-05", "2026-04-09"];

export default function ProductDetailScreen() {
  const redirect = useRequireRole("client");
  const router = useRouter();
  const theme = useResolvedTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const products = useAppStore((state) => state.products);
  const placeOrder = useAppStore((state) => state.placeOrder);
  const [selectedDate, setSelectedDate] = useState(DELIVERY_OPTIONS[0]);
  const [submitting, setSubmitting] = useState(false);

  const product = useMemo(
    () => products.find((item) => item.id === params.id) ?? products[0],
    [params.id, products],
  );

  if (redirect) {
    return redirect;
  }

  if (!product) {
    return null;
  }

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const order = await placeOrder(
        product.id,
        product.availability === "preorder" ? selectedDate : undefined,
      );

      router.push(`/client/checkout/${order.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenShell title="PRODUCT" subtitle={product.name} profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          <Panel style={styles.visualPanel}>
            <View style={[styles.visualBlock, { borderColor: theme.colors.border }]} />
            <View style={styles.visualMeta}>
              <StatusPill
                label={product.availability === "in_stock" ? "IN STOCK" : "PREORDER"}
                tone={product.availability === "in_stock" ? "solid" : "ghost"}
              />
              <Text style={[styles.visualCode, { color: theme.colors.textMuted }]}>
                SKU / {product.sku}
              </Text>
            </View>
          </Panel>

          <Panel style={styles.detailsPanel}>
            <SectionHeading title={product.name.toUpperCase()} subtitle={product.description} />
            <Text style={[styles.price, { color: theme.colors.textPrimary }]}>{product.price}</Text>

            <View style={styles.metaRows}>
              <View style={[styles.metaRow, { borderColor: theme.colors.border }]}>
                <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>STYLE</Text>
                <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>
                  {product.style.join(" / ").toUpperCase()}
                </Text>
              </View>
              <View style={[styles.metaRow, { borderColor: theme.colors.border }]}>
                <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>FIT</Text>
                <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>
                  STRUCTURED / RELAXED
                </Text>
              </View>
            </View>

            {product.availability === "preorder" ? (
              <View style={styles.preorderPanel}>
                <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                  CHOOSE DATE
                </Text>
                <View style={styles.dateGrid}>
                  {DELIVERY_OPTIONS.map((option) => (
                    <MonoButton
                      key={option}
                      label={option}
                      variant={selectedDate === option ? "primary" : "secondary"}
                      onPress={() => setSelectedDate(option)}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.actionRow}>
              <MonoButton
                label={
                  submitting
                    ? "ОФОРМЛЯЕМ..."
                    : product.availability === "in_stock"
                      ? "КУПИТЬ"
                      : "ОФОРМИТЬ ПРЕДЗАКАЗ"
                }
                onPress={handleSubmit}
              />
              <MonoButton label="НАЗАД" variant="secondary" onPress={() => router.back()} />
            </View>
          </Panel>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  visualPanel: {
    flex: 1,
    minWidth: 300,
    minHeight: 420,
    justifyContent: "space-between",
    gap: 18,
  },
  visualBlock: {
    flex: 1,
    minHeight: 320,
    borderWidth: 1,
    backgroundColor: "#121212",
  },
  visualMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  visualCode: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.6,
  },
  detailsPanel: {
    flex: 1,
    minWidth: 300,
    gap: 18,
  },
  price: {
    fontFamily: "Oswald_500Medium",
    fontSize: 42,
    letterSpacing: 1.4,
  },
  metaRows: {
    gap: 14,
  },
  metaRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  metaLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.6,
  },
  metaValue: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
  preorderPanel: {
    gap: 12,
  },
  dateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 8,
  },
});
