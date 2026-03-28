import { StyleSheet, Text, View } from "react-native";

import { useResolvedTheme } from "../lib/theme";

export function StatusPill({
  label,
  tone = "ghost",
}: {
  label: string;
  tone?: "solid" | "ghost";
}) {
  const theme = useResolvedTheme();
  const solid = tone === "solid";

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: solid ? theme.colors.accent : theme.colors.surface,
          borderColor: solid ? theme.colors.accent : theme.colors.borderSoft,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: solid ? theme.colors.accentContrast : theme.colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
  },
  label: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
});
