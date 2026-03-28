import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceChip } from "../../../components/ChoiceChip";
import { MonoButton } from "../../../components/MonoButton";
import { MonoInput } from "../../../components/MonoInput";
import { OrderTracker } from "../../../components/OrderTracker";
import { Panel } from "../../../components/Panel";
import { ProductCard } from "../../../components/ProductCard";
import { SectionHeading } from "../../../components/SectionHeading";
import { StatusPill } from "../../../components/StatusPill";
import { getProductImageSource } from "../shared";
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRail}>
        {chips.map((chip) => (
          <ChoiceChip
            key={chip.id}
            label={chip.label}
            active={chip.active}
            onPress={chip.onPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// 1. СЕНЬОРСКИЙ ТРЮК: Расширяем тип прямо здесь, добавляя наш bottomPadding
type ClientHomeExperienceProps = ClientHomeViewModel & {
  bottomPadding?: number; 
};

export function ClientHomeExperience({
  copy,
  featuredProduct,
  metrics,
  cartCount,
  activeOrder,
  categoryChips,
  availabilityChips,
  styleChips,
  brandChips,
  materialChips,
  fitChips,
  priceChips,
  collections,
  sections,
  searchValue,
  onSearchChange,
  onOpenCollection,
  onOpenProduct,
  onOpenProfile,
  onOpenCart,
  onClearFilters,
  bottomPadding = 0, // 2. Принимаем новый пропс со значением по умолчанию
}: ClientHomeExperienceProps) { // Используем наш расширенный тип
  const theme = useResolvedTheme();

  return (
    <ScrollView 
      // 3. ДОБАВЛЯЕМ ОТСТУП СЮДА. 
      // Мы берем стили из styles.container и "докидываем" к ним paddingBottom
      contentContainerStyle={[
        styles.container, 
        // Если bottomPadding передан, добавляем его к базовому отступу (22 из styles.container)
        { paddingBottom: styles.container.paddingBottom + bottomPadding }
      ]} 
      showsVerticalScrollIndicator={false}
    >
      {featuredProduct ? (
        <Panel style={styles.heroPanel}>
          <StatusPill label={copy.heroEyebrow} tone="solid" />
          <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
            {featuredProduct.name.toUpperCase()}
          </Text>
          <Text style={[styles.heroText, { color: theme.colors.textSecondary }]}>
            {copy.heroDescription}
          </Text>

          <View style={[styles.heroVisual, { borderColor: theme.colors.borderSoft }]}>
            <Image source={getProductImageSource(featuredProduct)} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroMeta}>
              <Text style={[styles.heroMetaText, { color: theme.colors.textMuted }]}>
                {featuredProduct.categoryName.toUpperCase()}
              </Text>
              <Text style={[styles.heroMetaText, { color: theme.colors.textPrimary }]}>
                {featuredProduct.formattedPrice}
              </Text>
            </View>
          </View>

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

          <View style={styles.heroActions}>
            <MonoButton label={copy.openProduct} onPress={() => onOpenProduct(featuredProduct.id)} />
            <MonoButton
              label={cartCount ? `${copy.openCart} / ${cartCount}` : copy.openCart}
              variant="secondary"
              onPress={onOpenCart}
            />
            <MonoButton label={copy.openProfile} variant="secondary" onPress={onOpenProfile} />
          </View>
        </Panel>
      ) : null}

      <Panel style={styles.filterPanel}>
        <SectionHeading title={copy.catalogTitle} subtitle={copy.catalogSubtitle} compact />
        <MonoInput
          label={copy.searchLabel}
          value={searchValue}
          onChangeText={onSearchChange}
          placeholder={copy.searchPlaceholder}
        />
        <FilterGroup label={copy.categoryFilter} chips={categoryChips} />
        <FilterGroup label={copy.availabilityFilter} chips={availabilityChips} />
        <FilterGroup label={copy.styleFilter} chips={styleChips} />
        <FilterGroup label={copy.brandFilter} chips={brandChips} />
        <FilterGroup label={copy.materialFilter} chips={materialChips} />
        <FilterGroup label={copy.fitFilter} chips={fitChips} />
        <FilterGroup label={copy.priceFilter} chips={priceChips} />
        <MonoButton label={copy.clearFilters} variant="secondary" onPress={onClearFilters} />
      </Panel>

      <Panel style={styles.collectionsPanel}>
        <SectionHeading title={copy.collectionsTitle} subtitle={copy.collectionsSubtitle} compact />
        <View style={styles.collectionsGrid}>
          {collections.map((collection) => (
            <Pressable
              key={collection.id}
              onPress={() => onOpenCollection(collection.id)}
              style={[
                styles.collectionCard,
                {
                  borderColor: theme.colors.borderSoft,
                  backgroundColor: theme.colors.surfaceSecondary,
                },
              ]}
            >
              <Image
                source={collection.coverUrl ? { uri: collection.coverUrl } : getProductImageSource()}
                style={styles.collectionImage}
                resizeMode="cover"
              />
              <Text style={[styles.collectionCount, { color: theme.colors.textMuted }]}>
                {collection.countLabel}
              </Text>
              <Text style={[styles.collectionTitle, { color: theme.colors.textPrimary }]}>
                {collection.title}
              </Text>
              <Text style={[styles.collectionText, { color: theme.colors.textSecondary }]}>
                {collection.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </Panel>

      {activeOrder ? (
        <Panel>
          <SectionHeading title={copy.activeOrderTitle} subtitle={copy.activeOrderSubtitle} compact />
          <OrderTracker order={activeOrder} />
        </Panel>
      ) : null}

      {sections.map((section) => (
        <View key={section.id} style={styles.sectionBlock}>
          <SectionHeading title={section.title} subtitle={section.subtitle} />
          <View style={styles.listBlock}>
            {section.products.map((product) => (
              <ProductCard
                key={`${section.id}-${product.id}`}
                product={product}
                onPress={() => onOpenProduct(product.id)}
                layout="mobile"
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
    gap: 14,
    // Этот базовый отступ мы сохранили, но теперь к нему приплюсовывается высота таббара
    paddingBottom: 22, 
  },
  heroPanel: {
    gap: 14,
  },
  heroTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 32, 
    lineHeight: 36, 
    letterSpacing: 1,
  },
  heroText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  heroVisual: {
    height: 240,
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroMeta: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  heroMetaText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: 100,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 8,
  },
  metricValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 26,
    letterSpacing: 0.9,
  },
  metricLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  heroActions: {
    gap: 10,
  },
  filterPanel: {
    gap: 14,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  filterRail: {
    gap: 10,
    paddingRight: 8,
  },
  collectionsPanel: {
    gap: 14,
  },
  collectionsGrid: {
    gap: 10,
  },
  collectionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 10,
    overflow: "hidden",
  },
  collectionImage: {
    width: "100%",
    height: 132,
    borderRadius: 14,
  },
  collectionCount: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  collectionTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    lineHeight: 26,
  },
  collectionText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  sectionBlock: {
    gap: 12,
  },
  listBlock: {
    gap: 12,
  },
});