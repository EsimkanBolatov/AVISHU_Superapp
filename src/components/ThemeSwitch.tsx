import { Pressable, StyleSheet, Text, View } from "react-native";

import { useResolvedTheme } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { ThemePreference } from "../types";

export function ThemeSwitch({
  showSystem = false,
  compact = false,
}: {
  showSystem?: boolean;
  compact?: boolean;
}) {
  const theme = useResolvedTheme();
  const preference = useAppStore((state) => state.themePreference);
  const setThemePreference = useAppStore((state) => state.setThemePreference);

  const options: ThemePreference[] = showSystem ? ["system", "light", "dark"] : ["light", "dark"];

  return (
    <View
      style={[
        styles.base,
        {
          borderColor: theme.colors.borderSoft,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      {options.map((option) => {
        const active = preference === option;
        return (
          <Pressable
              key={option}
              onPress={() => setThemePreference(option)}
              style={[
                styles.item,
                compact && styles.itemCompact,
                active && { backgroundColor: theme.colors.accent },
              ]}
            >
            <Text
              style={[
                styles.label,
                compact && styles.labelCompact,
                {
                  color: active ? theme.colors.accentContrast : theme.colors.textSecondary,
                },
              ]}
            >
              {option.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    borderWidth: 1,
    padding: 4,
    gap: 4,
    borderRadius: 999,
  },
  item: {
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 999,
  },
  itemCompact: {
    minWidth: 58,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  label: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  labelCompact: {
    fontSize: 9,
    letterSpacing: 1.1,
  },
});
