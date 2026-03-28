import { Pressable, StyleSheet, Text } from "react-native";

import { useResolvedTheme } from "../lib/theme";

export function ChoiceChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useResolvedTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        {
          borderColor: theme.colors.borderSoft,
          backgroundColor: active ? theme.colors.accent : theme.colors.surfaceSecondary,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: active ? theme.colors.accentContrast : theme.colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
  },
});
