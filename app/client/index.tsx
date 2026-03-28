import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { MonoButton } from "../../src/components/MonoButton";
import { OrderTracker } from "../../src/components/OrderTracker";
import { Panel } from "../../src/components/Panel";
import { ProductCard } from "../../src/components/ProductCard";
import { ScreenShell } from "../../src/components/ScreenShell";
import { SectionHeading } from "../../src/components/SectionHeading";
import { StatusPill } from "../../src/components/StatusPill";
import { referenceTechJacket } from "../../src/lib/brandArt";
import { useResolvedTheme } from "../../src/lib/theme";
import { useRequireRole } from "../../src/lib/useRequireRole";
import { useAppStore } from "../../src/store/useAppStore";

const STORY_MODULES = [
  "Ready-stock and preorder flows live in one premium retail canvas.",
  "The garment leads the screen, while operational data stays precise and quiet.",
  "This interface now follows a colder technical-fashion rhythm instead of a demo-marketplace feel.",
];

const SPEC_ROWS = [
  ["FIT RANGE", "XS / S / M / L / XL"],
  ["OUTER SHELL", "WATERPROOF / WIND-SAFE / MATTE FINISH"],
  ["FULFILLMENT", "READY STOCK OR SCHEDULED PREORDER"],
];

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
    <ScreenShell title="VITRINA" subtitle="COLLECTION / CLIENT FLOW" profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.heroPanel}>
          <View style={styles.heroCopy}>
            <StatusPill label="DROP 03 / MONOCHROME" tone="solid" />
            <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
              TECHNICAL OUTERWEAR WITH QUIET LUXURY RETAIL COMPOSITION
            </Text>
            <Text style={[styles.heroText, { color: theme.colors.textSecondary }]}>
              The client vitrina now leads with the garment first: large image fields, technical
              spec rhythm and a cleaner path from product discovery to order placement.
            </Text>

            <View style={styles.heroActions}>
              <MonoButton label="ENTER PRODUCT" onPress={() => router.push("/client/product/p-001")} />
              <MonoButton
                label="OPEN PROFILE"
                variant="secondary"
                onPress={() => router.push("/profile")}
              />
            </View>

            <View style={styles.specList}>
              {SPEC_ROWS.map(([label, value]) => (
                <View key={label} style={[styles.specRow, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.specLabel, { color: theme.colors.textMuted }]}>{label}</Text>
                  <Text style={[styles.specValue, { color: theme.colors.textSecondary }]}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.heroVisualWrap}>
            <View style={[styles.heroGlow, { backgroundColor: theme.colors.glow }]} />
            <View style={[styles.heroVisual, { borderColor: theme.colors.borderSoft }]}>
              <Image source={referenceTechJacket} style={styles.heroImage} resizeMode="cover" />

              <View style={styles.heroOverlayTop}>
                <Text style={[styles.overlayMeta, { color: theme.colors.textMuted }]}>
                  STORM SHELL / FIT PREVIEW
                </Text>
                <Text style={[styles.overlayCode, { color: theme.colors.textPrimary }]}>
                  SKU / P-001
                </Text>
              </View>

              <View style={styles.heroOverlayBottom}>
                <View style={styles.heroStatGrid}>
                  <View style={[styles.heroStat, { borderColor: theme.colors.borderSoft }]}>
                    <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                      {user?.loyaltyProgress ?? 0}%
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                      LOYALTY STATUS
                    </Text>
                  </View>

                  <View style={[styles.heroStat, { borderColor: theme.colors.borderSoft }]}>
                    <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>LIVE</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                      SOCKET SYNC
                    </Text>
                  </View>

                  <View style={[styles.heroStat, { borderColor: theme.colors.borderSoft }]}>
                    <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                      {products.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                      PRODUCTS
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Panel>

        <View style={styles.noteGrid}>
          {STORY_MODULES.map((note, index) => (
            <Panel key={note} style={styles.noteCard}>
              <Text style={[styles.noteIndex, { color: theme.colors.textMuted }]}>0{index + 1}</Text>
              <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>{note}</Text>
            </Panel>
          ))}
        </View>

        {activeOrder ? (
          <Panel>
            <SectionHeading
              title="ACTIVE ORDER"
              subtitle="The client sees status changes immediately after franchisee and atelier actions."
              compact
            />
            <OrderTracker order={activeOrder} />
          </Panel>
        ) : null}

        <SectionHeading
          title="CATALOG"
          subtitle="A premium grid for immediate purchase and preorder inside the same visual language."
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
    overflow: "hidden",
  },
  heroCopy: {
    flex: 0.92,
    minWidth: 280,
    gap: 14,
  },
  heroTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: 0.8,
  },
  heroText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 520,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 8,
  },
  specList: {
    gap: 10,
    paddingTop: 10,
  },
  specRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 6,
  },
  specLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  specValue: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    lineHeight: 21,
    letterSpacing: 0.8,
  },
  heroVisualWrap: {
    flex: 1,
    minWidth: 320,
    minHeight: 720,
  },
  heroGlow: {
    position: "absolute",
    top: -60,
    right: -50,
    width: 360,
    height: 360,
    borderRadius: 999,
    opacity: 0.9,
  },
  heroVisual: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  heroImage: {
    position: "absolute",
    right: -46,
    bottom: 0,
    width: 510,
    height: 720,
  },
  heroOverlayTop: {
    paddingHorizontal: 22,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  overlayMeta: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
  overlayCode: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
  heroOverlayBottom: {
    padding: 16,
  },
  heroStatGrid: {
    gap: 10,
  },
  heroStat: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    justifyContent: "space-between",
    minHeight: 94,
    backgroundColor: "rgba(255,255,255,0.12)",
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
  noteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  noteCard: {
    flexBasis: 240,
    flexGrow: 1,
    minHeight: 128,
    gap: 12,
  },
  noteIndex: {
    fontFamily: "Oswald_500Medium",
    fontSize: 22,
  },
  noteText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  catalogGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
});
