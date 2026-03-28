import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { MonoButton } from "../../../src/components/MonoButton";
import { Panel } from "../../../src/components/Panel";
import { ProductCard } from "../../../src/components/ProductCard";
import { ScreenShell } from "../../../src/components/ScreenShell";
import { SectionHeading } from "../../../src/components/SectionHeading";
import { StatusPill } from "../../../src/components/StatusPill";
import {
  getCategoryDescription,
  getCategoryLabel,
  getProductImageSource,
} from "../../../src/features/client/shared";
import { useRequireRole } from "../../../src/lib/useRequireRole";
import { useResolvedTheme } from "../../../src/lib/theme";
import { useAppStore } from "../../../src/store/useAppStore";
import { AppLanguage } from "../../../src/types";

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    eyebrow: string;
    totalProducts: string;
    heroLabel: string;
    back: string;
    openFeatured: string;
    emptyTitle: string;
    emptySubtitle: string;
  }
> = {
  ru: {
    shellTitle: "Коллекция",
    eyebrow: "COLLECTION DETAIL / CURATED RAIL",
    totalProducts: "Позиций",
    heroLabel: "Ключевой образ",
    back: "Назад",
    openFeatured: "Открыть продукт",
    emptyTitle: "В этой коллекции пока нет карточек",
    emptySubtitle: "Добавь товары в соответствующую категорию, и подборка появится автоматически.",
  },
  kk: {
    shellTitle: "Топтама",
    eyebrow: "COLLECTION DETAIL / CURATED RAIL",
    totalProducts: "Позиция",
    heroLabel: "Негізгі образ",
    back: "Артқа",
    openFeatured: "Өнімді ашу",
    emptyTitle: "Бұл топтамада әзірге карточкалар жоқ",
    emptySubtitle: "Сәйкес санатқа тауар қосылса, топтама автоматты түрде толтырылады.",
  },
  en: {
    shellTitle: "Collection",
    eyebrow: "COLLECTION DETAIL / CURATED RAIL",
    totalProducts: "Products",
    heroLabel: "Featured look",
    back: "Back",
    openFeatured: "Open product",
    emptyTitle: "This collection has no cards yet",
    emptySubtitle: "Add products to this category and the collection will populate automatically.",
  },
};

export default function CollectionDetailScreen() {
  const redirect = useRequireRole("client");
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const categories = useAppStore((state) => state.categories);
  const products = useAppStore((state) => state.products);
  const copy = COPY[language];
  const isMobile = width < 760;

  const category = useMemo(
    () => categories.find((item) => item.id === params.id) ?? categories[0],
    [categories, params.id],
  );

  const categoryProducts = useMemo(() => {
    if (!category) {
      return [];
    }

    return products.filter((product) => product.categoryId === category.id);
  }, [category, products]);

  if (redirect) {
    return redirect;
  }

  if (!category) {
    return null;
  }

  const featuredProduct = categoryProducts[0];

  return (
    <ScreenShell
      title={getCategoryLabel(category, language)}
      subtitle={copy.shellTitle}
      profileRoute="/profile"
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={[styles.heroPanel, isMobile && styles.heroPanelMobile]}>
          <View style={styles.heroCopy}>
            <StatusPill label={copy.eyebrow} tone="solid" />
            <SectionHeading
              title={getCategoryLabel(category, language)}
              subtitle={getCategoryDescription(category, language)}
            />

            <View style={[styles.metricCard, { borderColor: theme.colors.borderSoft }]}>
              <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>
                {copy.totalProducts}
              </Text>
              <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>
                {categoryProducts.length}
              </Text>
            </View>

            <View style={styles.actionRow}>
              <MonoButton label={copy.back} variant="secondary" onPress={() => router.back()} />
              {featuredProduct ? (
                <MonoButton
                  label={copy.openFeatured}
                  onPress={() => router.push(`/client/product/${featuredProduct.id}`)}
                />
              ) : null}
            </View>
          </View>

          {featuredProduct ? (
            <View style={[styles.heroVisual, { borderColor: theme.colors.borderSoft }]}>
              <Image
                source={getProductImageSource(featuredProduct)}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.heroMeta}>
                <Text style={[styles.heroMetaLabel, { color: theme.colors.textMuted }]}>
                  {copy.heroLabel}
                </Text>
                <Text style={[styles.heroMetaValue, { color: theme.colors.textPrimary }]}>
                  {featuredProduct.formattedPrice}
                </Text>
              </View>
            </View>
          ) : null}
        </Panel>

        {categoryProducts.length ? (
          <View style={[styles.grid, isMobile && styles.gridMobile]}>
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => router.push(`/client/product/${product.id}`)}
                layout={isMobile ? "mobile" : "web"}
              />
            ))}
          </View>
        ) : (
          <Panel style={styles.emptyPanel}>
            <SectionHeading title={copy.emptyTitle} subtitle={copy.emptySubtitle} compact />
          </Panel>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 28,
  },
  heroPanel: {
    flexDirection: "row",
    gap: 18,
    alignItems: "stretch",
  },
  heroPanelMobile: {
    flexDirection: "column",
  },
  heroCopy: {
    flex: 0.92,
    gap: 16,
    minWidth: 280,
  },
  metricCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 6,
    alignSelf: "flex-start",
    minWidth: 140,
  },
  metricLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  metricValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  heroVisual: {
    flex: 1,
    minHeight: 360,
    minWidth: 280,
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroMeta: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  heroMetaLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  heroMetaValue: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  gridMobile: {
    flexDirection: "column",
  },
  emptyPanel: {
    gap: 10,
  },
});
