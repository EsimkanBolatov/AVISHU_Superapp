import { Pressable, StyleSheet, Text, View } from "react-native";

import { useResolvedTheme } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { ThemePreference } from "../types";

export function ThemeSwitch({
  showSystem = false,
}: {
  showSystem?: boolean;
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
          borderColor: theme.colors.border,
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
              active && { backgroundColor: theme.colors.textPrimary },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: active ? theme.colors.background : theme.colors.textSecondary,
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
  },
  item: {
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  label: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
});
