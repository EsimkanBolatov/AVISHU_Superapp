import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceChip } from "../../src/components/ChoiceChip";
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
import { AppLanguage } from "../../src/types";

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    shellSubtitle: string;
    heroBadge: string;
    openProduct: string;
    openProfile: string;
    openCart: string;
    category: string;
    fitNotes: string;
    delivery: string;
    loyalty: string;
    tryOns: string;
    products: string;
    categoriesTitle: string;
    categoriesSubtitle: string;
    activeOrderTitle: string;
    activeOrderSubtitle: string;
    catalogTitle: string;
    catalogSubtitle: string;
  }
> = {
  ru: {
    shellTitle: "ВИТРИНА",
    shellSubtitle: "КАТАЛОГ / TRY-ON / CHECKOUT",
    heroBadge: "FEATURED DROP / PRODUCT SYSTEM",
    openProduct: "ОТКРЫТЬ ТОВАР",
    openProfile: "ОТКРЫТЬ ПРОФИЛЬ",
    openCart: "ОТКРЫТЬ КОРЗИНУ",
    category: "КАТЕГОРИЯ",
    fitNotes: "ПОСАДКА",
    delivery: "ДОСТАВКА",
    loyalty: "СТАТУС ЛОЯЛЬНОСТИ",
    tryOns: "TRY-ON СЕССИИ",
    products: "ПРОДУКТЫ",
    categoriesTitle: "КАТЕГОРИИ",
    categoriesSubtitle: "Полноценный слой каталога с группировкой и более выверенной навигацией по ассортименту.",
    activeOrderTitle: "АКТИВНЫЙ ЗАКАЗ",
    activeOrderSubtitle: "Клиент видит живые обновления после действий франчайзи и производства.",
    catalogTitle: "КАТАЛОГ",
    catalogSubtitle: "Премиальные карточки товаров с медиа, ценой, размерами и контекстом категории.",
  },
  kk: {
    shellTitle: "ВИТРИНА",
    shellSubtitle: "КАТАЛОГ / TRY-ON / CHECKOUT",
    heroBadge: "FEATURED DROP / PRODUCT SYSTEM",
    openProduct: "ӨНІМДІ АШУ",
    openProfile: "ПРОФИЛЬДІ АШУ",
    openCart: "СЕБЕТТІ АШУ",
    category: "САНАТ",
    fitNotes: "ОТЫРЫМЫ",
    delivery: "ЖЕТКІЗУ",
    loyalty: "ЛОЯЛДЫҚ ДЕҢГЕЙІ",
    tryOns: "TRY-ON СЕССИЯЛАРЫ",
    products: "ӨНІМДЕР",
    categoriesTitle: "САНАТТАР",
    categoriesSubtitle: "Топталған каталог қабаты және ассортимент бойынша дәлірек навигация.",
    activeOrderTitle: "БЕЛСЕНДІ ТАПСЫРЫС",
    activeOrderSubtitle: "Клиент франчайзи мен өндіріс әрекеттерінен кейінгі жаңартуларды бірден көреді.",
    catalogTitle: "КАТАЛОГ",
    catalogSubtitle: "Медиа, баға, өлшем және санат контексті бар премиум өнім карталары.",
  },
  en: {
    shellTitle: "VITRINA",
    shellSubtitle: "CATALOG / TRY-ON / CHECKOUT",
    heroBadge: "FEATURED DROP / PRODUCT SYSTEM",
    openProduct: "OPEN PRODUCT",
    openProfile: "OPEN PROFILE",
    openCart: "OPEN CART",
    category: "CATEGORY",
    fitNotes: "FIT NOTES",
    delivery: "DELIVERY",
    loyalty: "LOYALTY STATUS",
    tryOns: "TRY-ON SESSIONS",
    products: "PRODUCTS",
    categoriesTitle: "CATEGORIES",
    categoriesSubtitle: "A full catalog layer with grouped navigation and tighter merchandising control.",
    activeOrderTitle: "ACTIVE ORDER",
    activeOrderSubtitle: "The client sees live updates after franchisee and production actions.",
    catalogTitle: "CATALOG",
    catalogSubtitle: "Premium product cards with media, pricing, sizing and category context.",
  },
};

export default function ClientScreen() {
  const redirect = useRequireRole("client");
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const categories = useAppStore((state) => state.categories);
  const products = useAppStore((state) => state.products);
  const activeOrder = useAppStore((state) => state.activeOrder);
  const tryOnSessions = useAppStore((state) => state.tryOnSessions);
  const user = useAppStore((state) => state.user);
  const cartItems = useAppStore((state) => state.cartItems);
  const copy = COPY[language];

  if (redirect) {
    return redirect;
  }

  const featuredProduct = products.find((product) => product.featured) ?? products[0];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle} profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {featuredProduct ? (
          <Panel style={styles.heroPanel}>
            <View style={styles.heroCopy}>
              <StatusPill label={copy.heroBadge} tone="solid" />
              <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
                {featuredProduct.name.toUpperCase()}
              </Text>
              <Text style={[styles.heroText, { color: theme.colors.textSecondary }]}>
                {featuredProduct.subtitle}
              </Text>

              <View style={styles.heroActions}>
                <MonoButton
                  label={copy.openProduct}
                  onPress={() => router.push(`/client/product/${featuredProduct.id}`)}
                />
                <MonoButton
                  label={copy.openProfile}
                  variant="secondary"
                  onPress={() => router.push("/profile")}
                />
                <MonoButton
                  label={`${copy.openCart}${cartCount ? ` / ${cartCount}` : ""}`}
                  variant="secondary"
                  onPress={() => router.push("/client/cart")}
                />
              </View>

              <View style={styles.specList}>
                {[
                  [copy.category, featuredProduct.categoryName],
                  [copy.fitNotes, featuredProduct.fittingNotes],
                  [copy.delivery, featuredProduct.deliveryEstimate],
                ].map(([label, value]) => (
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
                <Image
                  source={featuredProduct.media[0]?.url ? { uri: featuredProduct.media[0].url } : referenceTechJacket}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
                <View
                  style={[
                    styles.imageVeil,
                    {
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                />

                <View style={styles.heroOverlayTop}>
                  <Text style={[styles.overlayMeta, { color: theme.colors.textMuted }]}>
                    {featuredProduct.categoryName.toUpperCase()} / {featuredProduct.sku}
                  </Text>
                  <Text style={[styles.overlayCode, { color: theme.colors.textPrimary }]}>
                    {featuredProduct.formattedPrice}
                  </Text>
                </View>

                <View style={styles.heroOverlayBottom}>
                  <View style={styles.heroStatGrid}>
                    <View style={[styles.heroStat, { borderColor: theme.colors.borderSoft }]}>
                      <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                        {user?.loyaltyProgress ?? 0}%
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                        {copy.loyalty}
                      </Text>
                    </View>

                    <View style={[styles.heroStat, { borderColor: theme.colors.borderSoft }]}>
                      <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                        {tryOnSessions.length}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                        {copy.tryOns}
                      </Text>
                    </View>

                    <View style={[styles.heroStat, { borderColor: theme.colors.borderSoft }]}>
                      <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                        {products.length}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                        {copy.products}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Panel>
        ) : null}

        <Panel>
          <SectionHeading title={copy.categoriesTitle} subtitle={copy.categoriesSubtitle} compact />
          <View style={styles.categoryRow}>
            {categories.map((category) => (
              <ChoiceChip
                key={category.id}
                label={category.name.toUpperCase()}
                active={featuredProduct?.categoryId === category.id}
                onPress={() => {
                  const target = products.find((product) => product.categoryId === category.id);
                  if (target) {
                    router.push(`/client/product/${target.id}`);
                  }
                }}
              />
            ))}
          </View>
        </Panel>

        {activeOrder ? (
          <Panel>
            <SectionHeading title={copy.activeOrderTitle} subtitle={copy.activeOrderSubtitle} compact />
            <OrderTracker order={activeOrder} />
          </Panel>
        ) : null}

        <SectionHeading title={copy.catalogTitle} subtitle={copy.catalogSubtitle} />

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
    flex: 0.9,
    minWidth: 280,
    gap: 16,
  },
  heroTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: 1,
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
    paddingTop: 8,
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
    minHeight: 760,
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
    width: "100%",
    height: "100%",
  },
  imageVeil: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "18%",
    opacity: 0.2,
  },
  heroOverlayTop: {
    position: "absolute",
    top: 20,
    left: 22,
    right: 22,
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
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
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
    backgroundColor: "rgba(255,255,255,0.08)",
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
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  catalogGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
});
