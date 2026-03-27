import { Pressable, StyleSheet, Text, View } from "react-native";

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

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.visual,
          {
            backgroundColor: theme.colors.surfaceSecondary,
            borderColor: theme.colors.border,
          },
        ]}
      />
      <View style={styles.content}>
        <StatusPill label={product.availability === "in_stock" ? "IN STOCK" : "PREORDER"} />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{product.name}</Text>
        <Text style={[styles.price, { color: theme.colors.textSecondary }]}>{product.price}</Text>
        <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
          {product.style.join(" / ").toUpperCase()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    flexBasis: 280,
    flexGrow: 1,
    minHeight: 320,
  },
  visual: {
    height: 220,
    borderBottomWidth: 1,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  title: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 1,
  },
  price: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 13,
    letterSpacing: 1,
  },
  meta: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 11,
    letterSpacing: 1.4,
  },
});
