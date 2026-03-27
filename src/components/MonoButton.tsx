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
          backgroundColor: isPrimary ? theme.colors.textPrimary : theme.colors.surfaceSecondary,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          isLarge && styles.largeLabel,
          {
            color: isPrimary ? theme.colors.background : theme.colors.textPrimary,
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
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  large: {
    minHeight: 74,
    paddingHorizontal: 24,
  },
  label: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.6,
  },
  largeLabel: {
    fontSize: 15,
  },
});
