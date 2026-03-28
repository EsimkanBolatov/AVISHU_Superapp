import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { getProductImageSource, getProductStock } from "../features/client/shared";
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
    stock: string;
  }
> = {
  ru: {
    inStock: "В наличии",
    preorder: "Предзаказ",
    sizes: "Размеры",
    discover: "Открыть продукт",
    stock: "Остаток",
  },
  kk: {
    inStock: "Қолда бар",
    preorder: "Алдын ала тапсырыс",
    sizes: "Өлшемдер",
    discover: "Өнімді ашу",
    stock: "Қор",
  },
  en: {
    inStock: "Ready stock",
    preorder: "Preorder",
    sizes: "Sizes",
    discover: "Open product",
    stock: "Stock",
  },
};

export function ProductCard({
  onPress,
  product,
  layout = "web",
}: {
  onPress: () => void;
  product: Product;
  layout?: "web" | "mobile";
}) {
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const copy = COPY[language];
  const imageSource = getProductImageSource(product);
  const stock = getProductStock(product);
  const isMobile = layout === "mobile";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        isMobile && styles.cardMobile,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSoft,
        },
      ]}
    >
      <View
        style={[
          styles.visualWrap,
          isMobile && styles.visualWrapMobile,
          { borderColor: theme.colors.borderSoft },
        ]}
      >
        <View style={[styles.glow, { backgroundColor: theme.colors.glow }]} />
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
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

      <View style={[styles.content, isMobile && styles.contentMobile]}>
        <View style={styles.header}>
          <Text
            numberOfLines={2}
            style={[styles.title, isMobile && styles.titleMobile, { color: theme.colors.textPrimary }]}
          >
            {product.name}
          </Text>
          <Text style={[styles.price, { color: theme.colors.textPrimary }]}>{product.formattedPrice}</Text>
        </View>

        <Text
          numberOfLines={2}
          style={[styles.subtitle, isMobile && styles.subtitleMobile, { color: theme.colors.textSecondary }]}
        >
          {product.subtitle}
        </Text>

        <View style={styles.footer}>
          <View style={[styles.metaRow, { borderColor: theme.colors.borderSoft }]}>
            <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
              {product.categoryName.toUpperCase()}
            </Text>
            <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>
              {product.style.join(" / ").toUpperCase()}
            </Text>
          </View>

          <View style={[styles.metaSplit, { borderColor: theme.colors.borderSoft }]}>
            <View style={styles.metaBlock}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.sizes}</Text>
              <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>
                {product.variants.map((variant) => variant.sizeLabel).join(" / ")}
              </Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.stock}</Text>
              <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>{stock}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 30,
    flexBasis: 340,
    flexGrow: 1,
    overflow: "hidden",
    minHeight: 590,
  },
  cardMobile: {
    width: "100%",
    flexBasis: "100%",
    flexGrow: 0,
    minHeight: 0,
    borderRadius: 20,
  },
  visualWrap: {
    height: 360,
    borderBottomWidth: 1,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  visualWrapMobile: {
    height: 220,
  },
  glow: {
    position: "absolute",
    top: -70,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 999,
    opacity: 0.7,
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
    height: 120,
    opacity: 0.16,
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
    padding: 22,
    gap: 16,
  },
  contentMobile: {
    padding: 14,
    gap: 8,
  },
  header: {
    gap: 8,
  },
  title: {
    fontFamily: "Oswald_500Medium",
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: 0.9,
  },
  titleMobile: {
    fontSize: 22,
    lineHeight: 24,
  },
  price: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 13,
    letterSpacing: 1.4,
  },
  subtitle: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 23,
  },
  subtitleMobile: {
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    marginTop: "auto",
    gap: 12,
  },
  metaRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  metaSplit: {
    borderTopWidth: 1,
    paddingTop: 12,
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
  },
  metaBlock: {
    flex: 1,
    minWidth: 120,
    gap: 6,
  },
  metaLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  metaValue: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 12,
    letterSpacing: 0.9,
  },
});
