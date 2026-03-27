import { useColorScheme } from "react-native";

import { useAppStore } from "../store/useAppStore";

type ThemeMode = "light" | "dark";

interface ThemePalette {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    surfaceSecondary: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
  };
}

const lightTheme: ThemePalette = {
  mode: "light",
  colors: {
    background: "#F4F1EC",
    surface: "#FFFFFF",
    surfaceSecondary: "#EBE7E1",
    border: "#0F0F0F",
    textPrimary: "#050505",
    textSecondary: "#3A3A3A",
    textMuted: "#6C6C6C",
  },
};

const darkTheme: ThemePalette = {
  mode: "dark",
  colors: {
    background: "#050505",
    surface: "#0D0D0D",
    surfaceSecondary: "#121212",
    border: "#2A2A2A",
    textPrimary: "#FFFFFF",
    textSecondary: "#CCCCCC",
    textMuted: "#7F7F7F",
  },
};

export function useResolvedTheme(): ThemePalette {
  const systemTheme = useColorScheme();
  const preference = useAppStore((state) => state.themePreference);

  const resolvedMode =
    preference === "system" ? (systemTheme === "light" ? "light" : "dark") : preference;

  return resolvedMode === "light" ? lightTheme : darkTheme;
}
