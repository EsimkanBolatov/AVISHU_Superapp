import { Pressable, StyleSheet, Text, View } from "react-native";

import { useResolvedTheme } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { AppLanguage } from "../types";

export function LanguageSwitch() {
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const options: AppLanguage[] = ["ru", "kk", "en"];

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
        const active = option === language;

        return (
          <Pressable
            key={option}
            onPress={() => setLanguage(option)}
            style={[
              styles.item,
              active && {
                backgroundColor: theme.colors.accent,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
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
    minWidth: 54,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 999,
  },
  label: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
});
