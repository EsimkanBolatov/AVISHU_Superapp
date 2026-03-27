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
          backgroundColor: solid ? theme.colors.textPrimary : theme.colors.surfaceSecondary,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: solid ? theme.colors.background : theme.colors.textSecondary,
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
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  label: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
});
