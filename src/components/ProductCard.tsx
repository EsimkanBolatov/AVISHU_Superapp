import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { referenceTechJacket } from "../lib/brandArt";
import { useResolvedTheme } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { AppLanguage, Product } from "../types";
import { StatusPill } from "./StatusPill";

const COPY: Record<
  AppLanguage,
  {
    inStock: string;
    preorder: string;
    sizes: string;
    discover: string;
  }
> = {
  ru: {
    inStock: "В НАЛИЧИИ",
    preorder: "ПРЕДЗАКАЗ",
    sizes: "РАЗМЕРЫ",
    discover: "ОТКРЫТЬ ПРОДУКТ",
  },
  kk: {
    inStock: "ДАЙЫН",
    preorder: "АЛДЫН АЛА ТАПСЫРЫС",
    sizes: "ӨЛШЕМДЕР",
    discover: "ӨНІМДІ АШУ",
  },
  en: {
    inStock: "READY STOCK",
    preorder: "PREORDER",
    sizes: "SIZES",
    discover: "OPEN PRODUCT",
  },
};

export function ProductCard({
  onPress,
  product,
}: {
  onPress: () => void;
  product: Product;
}) {
  const theme = useResolvedTheme();
  const { width } = useWindowDimensions();
  const language = useAppStore((state) => state.language);
  const copy = COPY[language];
  const isCompact = width < 760;
  const coverImage = product.media[0]?.url
    ? { uri: product.media[0].url }
    : referenceTechJacket;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        isCompact && styles.cardCompact,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSoft,
        },
      ]}
    >
      <View style={[styles.visualWrap, isCompact && styles.visualWrapCompact, { borderColor: theme.colors.borderSoft }]}>
        <View style={[styles.glow, { backgroundColor: theme.colors.glow }]} />
        <Image source={coverImage} style={styles.image} resizeMode="cover" />
        <View
          style={[
            styles.imageVeil,
            {
              backgroundColor: theme.colors.background,
            },
          ]}
        />
        <View style={styles.visualTop}>
          <StatusPill
            label={product.availability === "in_stock" ? copy.inStock : copy.preorder}
          />
          <Text style={[styles.sku, { color: theme.colors.textMuted }]}>{product.sku}</Text>
        </View>
        <View style={styles.visualBottom}>
          <Text style={[styles.discover, { color: theme.colors.textPrimary }]}>{copy.discover}</Text>
        </View>
      </View>

        <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, isCompact && styles.titleCompact, { color: theme.colors.textPrimary }]}>{product.name}</Text>
          <Text style={[styles.price, { color: theme.colors.textPrimary }]}>
            {product.formattedPrice}
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{product.subtitle}</Text>

        <View style={styles.footer}>
          <View style={[styles.metaRow, { borderColor: theme.colors.borderSoft }]}>
            <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
              {product.categoryName.toUpperCase()}
            </Text>
            <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>
              {product.style.join(" / ").toUpperCase()}
            </Text>
          </View>

          <View style={[styles.metaRow, { borderColor: theme.colors.borderSoft }]}>
            <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.sizes}</Text>
            <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>
              {product.variants.map((variant) => variant.sizeLabel).join(" / ")}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 28,
    flexBasis: 340,
    flexGrow: 1,
    overflow: "hidden",
    minHeight: 560,
  },
  cardCompact: {
    flexBasis: "100%",
    minHeight: 470,
  },
  visualWrap: {
    height: 350,
    borderBottomWidth: 1,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  visualWrapCompact: {
    height: 270,
  },
  glow: {
    position: "absolute",
    top: -60,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 999,
    opacity: 0.72,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageVeil: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
    opacity: 0.18,
  },
  visualTop: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  visualBottom: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    alignItems: "flex-end",
  },
  sku: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  discover: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.8,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  title: {
    fontFamily: "Oswald_500Medium",
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0.9,
  },
  titleCompact: {
    fontSize: 24,
    lineHeight: 28,
  },
  price: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 13,
    letterSpacing: 1.3,
  },
  subtitle: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 23,
  },
  footer: {
    marginTop: "auto",
    gap: 12,
  },
  metaRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 7,
  },
  metaLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  metaValue: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 12,
    letterSpacing: 1,
  },
});
