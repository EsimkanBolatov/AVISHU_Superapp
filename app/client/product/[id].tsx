import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MonoButton } from "../../../src/components/MonoButton";
import { Panel } from "../../../src/components/Panel";
import { ScreenShell } from "../../../src/components/ScreenShell";
import { SectionHeading } from "../../../src/components/SectionHeading";
import { StatusPill } from "../../../src/components/StatusPill";
import { referenceTechJacket } from "../../../src/lib/brandArt";
import { useResolvedTheme } from "../../../src/lib/theme";
import { useRequireRole } from "../../../src/lib/useRequireRole";
import { useAppStore } from "../../../src/store/useAppStore";

const DELIVERY_OPTIONS = ["2026-04-02", "2026-04-05", "2026-04-09"];
const TECH_SPECS = [
  ["FABRIC", "WATER-SAFE HIGH DENSITY SHELL"],
  ["SILHOUETTE", "STRUCTURED / RELAXED ARM SWING"],
  ["SYSTEM", "READY STOCK + PREORDER LOGIC"],
];

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
            <View style={[styles.visualBlock, { borderColor: theme.colors.borderSoft }]}>
              <View style={[styles.visualGlow, { backgroundColor: theme.colors.glow }]} />
              <Image source={referenceTechJacket} style={styles.visualImage} resizeMode="cover" />

              <View style={styles.visualTop}>
                <Text style={[styles.visualCode, { color: theme.colors.textMuted }]}>
                  SKU / {product.sku}
                </Text>
                <Text style={[styles.visualSize, { color: theme.colors.textPrimary }]}>XS - XL</Text>
              </View>

              <View style={styles.visualBottom}>
                <Text style={[styles.visualTitle, { color: theme.colors.textPrimary }]}>
                  IMAGE-LED PRODUCT STORY WITH CLEAN SPEC PRESENTATION
                </Text>
              </View>
            </View>

            <View style={styles.visualMeta}>
              <StatusPill
                label={product.availability === "in_stock" ? "READY STOCK" : "PREORDER"}
                tone={product.availability === "in_stock" ? "solid" : "ghost"}
              />
              <Text style={[styles.visualCode, { color: theme.colors.textMuted }]}>
                CLIENT PREVIEW / LIVE
              </Text>
            </View>
          </Panel>

          <Panel style={styles.detailsPanel}>
            <SectionHeading title={product.name.toUpperCase()} subtitle={product.description} />
            <Text style={[styles.price, { color: theme.colors.textPrimary }]}>{product.price}</Text>

            <View style={styles.metaRows}>
              <View style={[styles.metaRow, { borderColor: theme.colors.borderSoft }]}>
                <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>STYLE</Text>
                <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>
                  {product.style.join(" / ").toUpperCase()}
                </Text>
              </View>

              {TECH_SPECS.map(([label, value]) => (
                <View key={label} style={[styles.metaRow, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{label}</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>{value}</Text>
                </View>
              ))}
            </View>

            {product.availability === "preorder" ? (
              <View style={styles.preorderPanel}>
                <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                  SELECT DELIVERY WINDOW
                </Text>
                <View style={styles.dateGrid}>
                  {DELIVERY_OPTIONS.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => setSelectedDate(option)}
                      style={[
                        styles.dateChip,
                        {
                          borderColor: theme.colors.borderSoft,
                          backgroundColor:
                            selectedDate === option ? theme.colors.accent : theme.colors.surface,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateChipText,
                          {
                            color:
                              selectedDate === option
                                ? theme.colors.accentContrast
                                : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            <Panel style={styles.tryOnPanel}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>AI TRY-ON NEXT</Text>
              <Text style={[styles.tryOnCopy, { color: theme.colors.textSecondary }]}>
                The next product phase should let the client upload a full-body photo, generate a
                styled preview and save the result to the order history.
              </Text>
            </Panel>

            <View style={styles.actionRow}>
              <MonoButton
                label={
                  submitting
                    ? "CREATING ORDER..."
                    : product.availability === "in_stock"
                      ? "BUY NOW"
                      : "CREATE PREORDER"
                }
                onPress={handleSubmit}
              />
              <MonoButton label="BACK" variant="secondary" onPress={() => router.back()} />
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
    minHeight: 720,
    justifyContent: "space-between",
    gap: 18,
  },
  visualBlock: {
    flex: 1,
    minHeight: 620,
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
  },
  visualGlow: {
    position: "absolute",
    top: -50,
    right: -40,
    width: 320,
    height: 320,
    borderRadius: 999,
    opacity: 0.88,
  },
  visualImage: {
    position: "absolute",
    right: -54,
    bottom: 0,
    width: 480,
    height: 700,
  },
  visualTop: {
    paddingHorizontal: 22,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  visualBottom: {
    paddingHorizontal: 22,
    paddingBottom: 22,
    maxWidth: 340,
  },
  visualTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: 0.7,
  },
  visualMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  visualSize: {
    fontFamily: "Oswald_500Medium",
    fontSize: 22,
    letterSpacing: 1,
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
  dateChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateChipText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  tryOnPanel: {
    gap: 10,
  },
  tryOnCopy: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 23,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 8,
  },
});
