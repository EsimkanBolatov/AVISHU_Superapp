import { StyleSheet, Text, View } from "react-native";

import { useResolvedTheme } from "../lib/theme";

export function SectionHeading({
  title,
  subtitle,
  compact = false,
}: {
  title: string;
  subtitle: string;
  compact?: boolean;
}) {
  const theme = useResolvedTheme();

  return (
    <View style={[styles.base, compact && styles.compact]}>
      <Text style={[styles.title, compact && styles.titleCompact, { color: theme.colors.textPrimary }]}>
        {title}
      </Text>
      <Text
        style={[
          styles.subtitle,
          compact && styles.subtitleCompact,
          { color: theme.colors.textSecondary },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    gap: 8,
  },
  compact: {
    gap: 6,
  },
  title: {
    fontFamily: "Oswald_500Medium",
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: 1,
  },
  titleCompact: {
    fontSize: 25,
    lineHeight: 29,
  },
  subtitle: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 23,
  },
  subtitleCompact: {
    fontSize: 13,
    lineHeight: 20,
  },
});
