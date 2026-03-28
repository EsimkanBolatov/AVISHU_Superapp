import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { referenceTechJacket } from "../lib/brandArt";
import { useResolvedTheme } from "../lib/theme";
import { Product } from "../types";
import { StatusPill } from "./StatusPill";

export function ProductCard({
  onPress,
  product,
}: {
  onPress: () => void;
  product: Product;
}) {
  const theme = useResolvedTheme();
  const coverImage = product.media[0]?.url
    ? { uri: product.media[0].url }
    : referenceTechJacket;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSoft,
        },
      ]}
    >
      <View style={[styles.visualWrap, { borderColor: theme.colors.borderSoft }]}>
        <View style={[styles.glow, { backgroundColor: theme.colors.glow }]} />
        <Image source={coverImage} style={styles.image} resizeMode="cover" />
        <View style={styles.visualTop}>
          <StatusPill label={product.availability === "in_stock" ? "READY STOCK" : "PREORDER"} />
          <Text style={[styles.sku, { color: theme.colors.textMuted }]}>{product.sku}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{product.name}</Text>
          <Text style={[styles.price, { color: theme.colors.textPrimary }]}>
            {product.formattedPrice}
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{product.subtitle}</Text>

        <View style={[styles.metaRow, { borderColor: theme.colors.borderSoft }]}>
          <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
            {product.categoryName.toUpperCase()}
          </Text>
          <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>
            {product.variants.map((variant) => variant.sizeLabel).join(" / ")}
          </Text>
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
    minHeight: 500,
  },
  visualWrap: {
    height: 310,
    borderBottomWidth: 1,
    overflow: "hidden",
    justifyContent: "space-between",
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
  sku: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  content: {
    padding: 18,
    gap: 14,
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
