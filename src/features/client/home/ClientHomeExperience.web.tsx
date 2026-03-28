import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceChip } from "../../../components/ChoiceChip";
import { MonoButton } from "../../../components/MonoButton";
import { MonoInput } from "../../../components/MonoInput";
import { OrderTracker } from "../../../components/OrderTracker";
import { Panel } from "../../../components/Panel";
import { ProductCard } from "../../../components/ProductCard";
import { SectionHeading } from "../../../components/SectionHeading";
import { StatusPill } from "../../../components/StatusPill";
import { getProductImageSource, getProductStock } from "../shared";
import { ClientHomeViewModel } from "../view-models";
import { useResolvedTheme } from "../../../lib/theme";

function FilterGroup({
  label,
  chips,
}: {
  label: string;
  chips: ClientHomeViewModel["categoryChips"];
}) {
  const theme = useResolvedTheme();

  return (
    <View style={styles.filterGroup}>
      <Text style={[styles.filterLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <View style={styles.filterRow}>
        {chips.map((chip) => (
          <ChoiceChip
            key={chip.id}
            label={chip.label}
            active={chip.active}
            onPress={chip.onPress}
          />
        ))}
      </View>
    </View>
  );
}

export function ClientHomeExperience({
  copy,
  featuredProduct,
  metrics,
  cartCount,
  activeOrder,
  categoryChips,
  availabilityChips,
  styleChips,
  collections,
  sections,
  searchValue,
  onSearchChange,
  onOpenCollection,
  onOpenProduct,
  onOpenProfile,
  onOpenCart,
  onClearFilters,
}: ClientHomeViewModel) {
  const theme = useResolvedTheme();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {featuredProduct ? (
        <Panel style={styles.heroPanel}>
          <View style={styles.heroCopy}>
            <StatusPill label={copy.heroEyebrow} tone="solid" />
            <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
              {copy.heroTitlePrefix}
              {"\n"}
              {featuredProduct.name.toUpperCase()}
            </Text>
            <Text style={[styles.heroText, { color: theme.colors.textSecondary }]}>
              {copy.heroDescription}
            </Text>

            <View style={styles.metricRow}>
              {metrics.map((metric) => (
                <View
                  key={metric.label}
                  style={[
                    styles.metricCard,
                    {
                      borderColor: theme.colors.borderSoft,
                      backgroundColor: theme.colors.surfaceSecondary,
                    },
                  ]}
                >
                  <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>{metric.value}</Text>
                  <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>{metric.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.specGrid}>
              <View style={[styles.specCard, { borderColor: theme.colors.borderSoft }]}>
                <Text style={[styles.specLabel, { color: theme.colors.textMuted }]}>{copy.stockReady}</Text>
                <Text style={[styles.specValue, { color: theme.colors.textPrimary }]}>
                  {getProductStock(featuredProduct)}
                </Text>
              </View>
              <View style={[styles.specCard, { borderColor: theme.colors.borderSoft }]}>
                <Text style={[styles.specLabel, { color: theme.colors.textMuted }]}>{copy.stockPreorder}</Text>
                <Text style={[styles.specValue, { color: theme.colors.textPrimary }]}>
                  {featuredProduct.availability === "preorder" ? "YES" : "NO"}
                </Text>
              </View>
            </View>

            <View style={styles.heroActions}>
              <MonoButton label={copy.openProduct} onPress={() => onOpenProduct(featuredProduct.id)} />
              <MonoButton label={copy.openProfile} variant="secondary" onPress={onOpenProfile} />
              <MonoButton
                label={cartCount ? `${copy.openCart} / ${cartCount}` : copy.openCart}
                variant="secondary"
                onPress={onOpenCart}
              />
            </View>
          </View>

          <View style={styles.heroVisualWrap}>
            <View style={[styles.heroGlow, { backgroundColor: theme.colors.glow }]} />
            <View style={[styles.heroVisual, { borderColor: theme.colors.borderSoft }]}>
              <Image
                source={getProductImageSource(featuredProduct)}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.heroMeta}>
                <Text style={[styles.heroMetaText, { color: theme.colors.textMuted }]}>
                  {featuredProduct.categoryName.toUpperCase()} / {featuredProduct.sku}
                </Text>
                <Text style={[styles.heroMetaText, { color: theme.colors.textPrimary }]}>
                  {featuredProduct.formattedPrice}
                </Text>
              </View>
              <View style={styles.heroCaption}>
                <Text style={[styles.heroSubtitle, { color: theme.colors.textPrimary }]}>
                  {featuredProduct.subtitle}
                </Text>
              </View>
            </View>
          </View>
        </Panel>
      ) : null}

      <Panel style={styles.filterPanel}>
        <View style={styles.filterHeader}>
          <SectionHeading title={copy.catalogTitle} subtitle={copy.catalogSubtitle} compact />
          <MonoButton label={copy.clearFilters} variant="secondary" onPress={onClearFilters} />
        </View>

        <MonoInput
          label={copy.searchLabel}
          value={searchValue}
          onChangeText={onSearchChange}
          placeholder={copy.searchPlaceholder}
        />

        <FilterGroup label={copy.categoryFilter} chips={categoryChips} />
        <FilterGroup label={copy.availabilityFilter} chips={availabilityChips} />
        <FilterGroup label={copy.styleFilter} chips={styleChips} />
      </Panel>

      <View style={styles.collectionHeader}>
        <SectionHeading title={copy.collectionsTitle} subtitle={copy.collectionsSubtitle} />
      </View>

      <View style={styles.collectionGrid}>
        {collections.map((collection) => (
          <Pressable
            key={collection.id}
            onPress={() => onOpenCollection(collection.id)}
            style={styles.collectionPressable}
          >
            <Panel style={styles.collectionCard}>
              <View style={[styles.collectionVisual, { borderColor: theme.colors.borderSoft }]}>
                <Image
                  source={collection.coverUrl ? { uri: collection.coverUrl } : getProductImageSource()}
                  style={styles.collectionImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.collectionCopy}>
                <Text style={[styles.collectionCount, { color: theme.colors.textMuted }]}>
                  {collection.countLabel}
                </Text>
                <Text style={[styles.collectionTitle, { color: theme.colors.textPrimary }]}>
                  {collection.title}
                </Text>
                <Text style={[styles.collectionText, { color: theme.colors.textSecondary }]}>
                  {collection.description}
                </Text>
              </View>
            </Panel>
          </Pressable>
        ))}
      </View>

      {activeOrder ? (
        <Panel>
          <SectionHeading title={copy.activeOrderTitle} subtitle={copy.activeOrderSubtitle} compact />
          <OrderTracker order={activeOrder} />
        </Panel>
      ) : null}

      {sections.map((section) => (
        <View key={section.id} style={styles.sectionBlock}>
          <SectionHeading title={section.title} subtitle={section.subtitle} />
          <View style={styles.catalogGrid}>
            {section.products.map((product) => (
              <ProductCard
                key={`${section.id}-${product.id}`}
                product={product}
                onPress={() => onOpenProduct(product.id)}
                layout="web"
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 26,
  },
  heroPanel: {
    flexDirection: "row",
    gap: 18,
    alignItems: "stretch",
  },
  heroCopy: {
    flex: 0.96,
    gap: 18,
    minWidth: 340,
  },
  heroTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 60,
    lineHeight: 62,
    letterSpacing: 1.4,
  },
  heroText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 560,
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    minWidth: 150,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  metricValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 32,
    letterSpacing: 1,
  },
  metricLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  specGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  specCard: {
    minWidth: 180,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  specLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  specValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 30,
    letterSpacing: 1,
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  heroVisualWrap: {
    flex: 1,
    minWidth: 360,
    minHeight: 760,
  },
  heroGlow: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 380,
    height: 380,
    borderRadius: 999,
    opacity: 0.82,
  },
  heroVisual: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 30,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroMeta: {
    position: "absolute",
    top: 20,
    left: 22,
    right: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  heroMetaText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
  heroCaption: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 22,
  },
  heroSubtitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: 0.8,
    maxWidth: 420,
  },
  filterPanel: {
    gap: 16,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },
  filterGroup: {
    gap: 10,
  },
  filterLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  collectionHeader: {
    marginTop: 6,
  },
  collectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  collectionPressable: {
    flexBasis: 260,
    flexGrow: 1,
  },
  collectionCard: {
    gap: 16,
    height: "100%",
  },
  collectionVisual: {
    height: 180,
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  collectionImage: {
    width: "100%",
    height: "100%",
  },
  collectionCopy: {
    gap: 8,
  },
  collectionCount: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
  collectionTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: 0.8,
  },
  collectionText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  sectionBlock: {
    gap: 14,
  },
  catalogGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
});
