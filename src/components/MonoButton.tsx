import { Pressable, StyleSheet, Text } from "react-native";

import { useResolvedTheme } from "../lib/theme";

export function MonoButton({
  label,
  onPress,
  variant = "primary",
  size = "medium",
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  size?: "medium" | "large";
}) {
  const theme = useResolvedTheme();
  const isPrimary = variant === "primary";
  const isLarge = size === "large";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        isLarge && styles.large,
        {
          backgroundColor: isPrimary ? theme.colors.accent : theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          isLarge && styles.largeLabel,
          {
            color: isPrimary ? theme.colors.accentContrast : theme.colors.textPrimary,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
  },
  large: {
    minHeight: 76,
    paddingHorizontal: 28,
  },
  label: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
  largeLabel: {
    fontSize: 14,
  },
});
