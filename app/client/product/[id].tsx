import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { ChoiceChip } from "../../../src/components/ChoiceChip";
import { MonoButton } from "../../../src/components/MonoButton";
import { MonoInput } from "../../../src/components/MonoInput";
import { Panel } from "../../../src/components/Panel";
import { ScreenShell } from "../../../src/components/ScreenShell";
import { SectionHeading } from "../../../src/components/SectionHeading";
import { StatusPill } from "../../../src/components/StatusPill";
import { referenceTechJacket } from "../../../src/lib/brandArt";
import { useResolvedTheme } from "../../../src/lib/theme";
import { useRequireRole } from "../../../src/lib/useRequireRole";
import { useAppStore } from "../../../src/store/useAppStore";
import { AppLanguage } from "../../../src/types";

const DELIVERY_OPTIONS = ["2026-04-02", "2026-04-05", "2026-04-09"];

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    sku: string;
    category: string;
    composition: string;
    fitNotes: string;
    delivery: string;
    sizeSelection: string;
    selectDelivery: string;
    tryOnTitle: string;
    tryOnSubtitle: string;
    sourceImage: string;
    generate: string;
    generating: string;
    ready: string;
    preorder: string;
    addToCart: string;
    continue: string;
    back: string;
    cart: string;
  }
> = {
  ru: {
    shellTitle: "ПРОДУКТ",
    sku: "SKU",
    category: "КАТЕГОРИЯ",
    composition: "СОСТАВ",
    fitNotes: "ПОСАДКА",
    delivery: "ДОСТАВКА",
    sizeSelection: "ВЫБОР РАЗМЕРА",
    selectDelivery: "ВЫБЕРИ ОКНО ДОСТАВКИ",
    tryOnTitle: "AI TRY-ON PIPELINE",
    tryOnSubtitle: "Вставь ссылку на фото, чтобы создать сохраненный preview, привязанный к профилю.",
    sourceImage: "ССЫЛКА НА ИСХОДНОЕ ФОТО",
    generate: "СОЗДАТЬ TRY-ON",
    generating: "ГЕНЕРАЦИЯ...",
    ready: "ГОТОВО К CHECKOUT",
    preorder: "РЕЖИМ ПРЕДЗАКАЗА",
    addToCart: "ДОБАВИТЬ В КОРЗИНУ",
    continue: "К ЧЕКАУТУ",
    back: "НАЗАД",
    cart: "ОТКРЫТЬ КОРЗИНУ",
  },
  kk: {
    shellTitle: "ӨНІМ",
    sku: "SKU",
    category: "САНАТ",
    composition: "ҚҰРАМЫ",
    fitNotes: "ОТЫРЫМЫ",
    delivery: "ЖЕТКІЗУ",
    sizeSelection: "ӨЛШЕМДІ ТАҢДАУ",
    selectDelivery: "ЖЕТКІЗУ ТЕРЕЗЕСІН ТАҢДА",
    tryOnTitle: "AI TRY-ON PIPELINE",
    tryOnSubtitle: "Профильге байланысатын preview жасау үшін фото сілтемесін енгіз.",
    sourceImage: "БАСТАПҚЫ ФОТО СІЛТЕМЕСІ",
    generate: "TRY-ON ЖАСАУ",
    generating: "ЖАСАЛУДА...",
    ready: "CHECKOUT-КА ДАЙЫН",
    preorder: "АЛДЫН АЛА ТАПСЫРЫС",
    addToCart: "СЕБЕТКЕ ҚОСУ",
    continue: "CHECKOUT-КА ӨТУ",
    back: "АРТҚА",
    cart: "СЕБЕТТІ АШУ",
  },
  en: {
    shellTitle: "PRODUCT",
    sku: "SKU",
    category: "CATEGORY",
    composition: "COMPOSITION",
    fitNotes: "FIT NOTES",
    delivery: "DELIVERY",
    sizeSelection: "SIZE SELECTION",
    selectDelivery: "SELECT DELIVERY WINDOW",
    tryOnTitle: "AI TRY-ON PIPELINE",
    tryOnSubtitle: "Paste a source image URL to create a saved preview tied to your profile.",
    sourceImage: "SOURCE IMAGE URL",
    generate: "CREATE TRY-ON",
    generating: "GENERATING...",
    ready: "READY FOR CHECKOUT",
    preorder: "PREORDER FLOW",
    addToCart: "ADD TO CART",
    continue: "CONTINUE TO CHECKOUT",
    back: "BACK",
    cart: "OPEN CART",
  },
};

export default function ProductDetailScreen() {
  const redirect = useRequireRole("client");
  const router = useRouter();
  const theme = useResolvedTheme();
  const { width } = useWindowDimensions();
  const language = useAppStore((state) => state.language);
  const params = useLocalSearchParams<{ id: string }>();
  const products = useAppStore((state) => state.products);
  const createTryOn = useAppStore((state) => state.createTryOn);
  const tryOnSessions = useAppStore((state) => state.tryOnSessions);
  const addToCart = useAppStore((state) => state.addToCart);
  const copy = COPY[language];
  const isCompact = width < 760;
  const [selectedDate, setSelectedDate] = useState(DELIVERY_OPTIONS[0]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [photoUrl, setPhotoUrl] = useState("");
  const [submittingTryOn, setSubmittingTryOn] = useState(false);
  const [selectedTryOnId, setSelectedTryOnId] = useState<string | null>(null);

  const product = useMemo(
    () => products.find((item) => item.id === params.id) ?? products[0],
    [params.id, products],
  );

  const productTryOns = tryOnSessions.filter((session) => session.productId === product?.id);

  if (redirect) {
    return redirect;
  }

  if (!product) {
    return null;
  }

  const activeMedia = product.media[activeMediaIndex]?.url
    ? { uri: product.media[activeMediaIndex].url }
    : referenceTechJacket;

  const activeVariantId = selectedVariantId ?? product.variants[0]?.id;

  const handleCreateTryOn = async () => {
    if (!photoUrl.trim()) {
      return;
    }

    setSubmittingTryOn(true);

    try {
      const tryOn = await createTryOn({
        productId: product.id,
        sourceImageUrl: photoUrl.trim(),
        notes: `Generated for ${product.name}.`,
      });

      setSelectedTryOnId(tryOn.id);
      setPhotoUrl("");
    } finally {
      setSubmittingTryOn(false);
    }
  };

  return (
    <ScreenShell title={copy.shellTitle} subtitle={product.name} profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          <Panel style={styles.visualPanel}>
            <View style={[styles.visualBlock, isCompact && styles.visualBlockCompact, { borderColor: theme.colors.borderSoft }]}>
              <Image source={activeMedia} style={styles.visualImage} resizeMode="cover" />

              <View style={styles.visualTop}>
                <Text style={[styles.visualCode, { color: theme.colors.textMuted }]}>
                  {copy.sku} / {product.sku}
                </Text>
                <Text style={[styles.visualSize, { color: theme.colors.textPrimary }]}>
                  {product.formattedPrice}
                </Text>
              </View>

              <View style={styles.visualBottom}>
                <Text style={[styles.visualTitle, { color: theme.colors.textPrimary }]}>
                  {product.subtitle.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.thumbnailRow}>
              {product.media.map((media, index) => (
                <ChoiceChip
                  key={media.id}
                  label={`IMG ${index + 1}`}
                  active={activeMediaIndex === index}
                  onPress={() => setActiveMediaIndex(index)}
                />
              ))}
            </View>
          </Panel>

          <Panel style={styles.detailsPanel}>
            <SectionHeading title={product.name.toUpperCase()} subtitle={product.description} />
            <Text style={[styles.price, isCompact && styles.priceCompact, { color: theme.colors.textPrimary }]}>{product.formattedPrice}</Text>

            <View style={styles.metaRows}>
              {[
                [copy.category, product.categoryName],
                [copy.composition, product.composition],
                [copy.fitNotes, product.fittingNotes],
                [copy.delivery, product.deliveryEstimate],
              ].map(([label, value]) => (
                <View key={label} style={[styles.metaRow, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{label}</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.selectionBlock}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.sizeSelection}</Text>
              <View style={styles.chipRow}>
                {product.variants.map((variant) => (
                  <ChoiceChip
                    key={variant.id}
                    label={`${variant.sizeLabel} / ${variant.stock}`}
                    active={activeVariantId === variant.id}
                    onPress={() => setSelectedVariantId(variant.id)}
                  />
                ))}
              </View>
            </View>

            {product.availability === "preorder" ? (
              <View style={styles.selectionBlock}>
                <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.selectDelivery}</Text>
                <View style={styles.chipRow}>
                  {DELIVERY_OPTIONS.map((option) => (
                    <ChoiceChip
                      key={option}
                      label={option}
                      active={selectedDate === option}
                      onPress={() => setSelectedDate(option)}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            <Panel style={styles.tryOnPanel}>
              <SectionHeading title={copy.tryOnTitle} subtitle={copy.tryOnSubtitle} compact />
              <MonoInput
                label={copy.sourceImage}
                value={photoUrl}
                onChangeText={setPhotoUrl}
                placeholder="https://..."
                autoCapitalize="none"
              />
              <MonoButton
                label={submittingTryOn ? copy.generating : copy.generate}
                variant="secondary"
                onPress={handleCreateTryOn}
              />

              <View style={styles.tryOnRow}>
                {productTryOns.map((session) => (
                  <ChoiceChip
                    key={session.id}
                    label={new Date(session.createdAt).toLocaleDateString(language)}
                    active={selectedTryOnId === session.id}
                    onPress={() => setSelectedTryOnId(session.id)}
                  />
                ))}
              </View>
            </Panel>

            <StatusPill
              label={product.availability === "in_stock" ? copy.ready : copy.preorder}
              tone={product.availability === "in_stock" ? "solid" : "ghost"}
            />

            <View style={styles.actionRow}>
              <MonoButton
                label={copy.addToCart}
                variant="secondary"
                onPress={() => {
                  if (!activeVariantId) {
                    return;
                  }

                  addToCart({
                    productId: product.id,
                    variantId: activeVariantId,
                    scheduledDate: product.availability === "preorder" ? selectedDate : undefined,
                    tryOnId: selectedTryOnId ?? undefined,
                  });
                }}
              />
              <MonoButton
                label={copy.continue}
                onPress={() =>
                  router.push({
                    pathname: `/client/checkout/${product.id}`,
                    params: {
                      variantId: activeVariantId,
                      scheduledDate:
                        product.availability === "preorder" ? selectedDate : undefined,
                      tryOnId: selectedTryOnId ?? undefined,
                    },
                  })
                }
              />
              <MonoButton label={copy.cart} variant="secondary" onPress={() => router.push("/client/cart")} />
              <MonoButton label={copy.back} variant="secondary" onPress={() => router.back()} />
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
    gap: 18,
  },
  visualBlock: {
    minHeight: 620,
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
  },
  visualBlockCompact: {
    minHeight: 420,
  },
  visualImage: {
    width: "100%",
    height: "100%",
  },
  visualTop: {
    position: "absolute",
    top: 20,
    left: 22,
    right: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  visualBottom: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 22,
    maxWidth: 360,
  },
  visualTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: 0.7,
  },
  thumbnailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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
  priceCompact: {
    fontSize: 34,
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
  selectionBlock: {
    gap: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tryOnPanel: {
    gap: 12,
  },
  tryOnRow: {
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
