import { useColorScheme } from "react-native";

import { useAppStore } from "../store/useAppStore";

type ThemeMode = "light" | "dark";

interface ThemePalette {
  mode: ThemeMode;
  colors: {
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceSecondary: string;
    surfaceTertiary: string;
    border: string;
    borderSoft: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentContrast: string;
    glow: string;
  };
}

const lightTheme: ThemePalette = {
  mode: "light",
  colors: {
    background: "#F7F5F1",
    backgroundSecondary: "#EEE9E2",
    surface: "rgba(255,255,255,0.84)",
    surfaceSecondary: "#F2EEEA",
    surfaceTertiary: "#E9E3DB",
    border: "#181818",
    borderSoft: "rgba(24,24,24,0.12)",
    textPrimary: "#101010",
    textSecondary: "#44413C",
    textMuted: "#7D756B",
    accent: "#111111",
    accentContrast: "#F8F6F3",
    glow: "rgba(255,255,255,0.92)",
  },
};

const darkTheme: ThemePalette = {
  mode: "dark",
  colors: {
    background: "#090909",
    backgroundSecondary: "#121212",
    surface: "rgba(15,15,15,0.88)",
    surfaceSecondary: "#141414",
    surfaceTertiary: "#191919",
    border: "#2A2A2A",
    borderSoft: "rgba(255,255,255,0.08)",
    textPrimary: "#F5F3EF",
    textSecondary: "#D1CBC4",
    textMuted: "#817A73",
    accent: "#F2EEE8",
    accentContrast: "#090909",
    glow: "rgba(36,36,36,0.9)",
  },
};

export function useResolvedTheme(): ThemePalette {
  const systemTheme = useColorScheme();
  const preference = useAppStore((state) => state.themePreference);

  const resolvedMode =
    preference === "system" ? (systemTheme === "light" ? "light" : "dark") : preference;

  return resolvedMode === "light" ? lightTheme : darkTheme;
}
