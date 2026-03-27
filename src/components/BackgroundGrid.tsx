import { StyleSheet, View } from "react-native";

import { useResolvedTheme } from "../lib/theme";

export function BackgroundGrid() {
  const theme = useResolvedTheme();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View
          key={`vertical-${index}`}
          style={[
            styles.vertical,
            {
              left: `${10 + index * 22}%`,
              backgroundColor: theme.mode === "dark" ? "#111111" : "#D9D3CB",
            },
          ]}
        />
      ))}
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={`horizontal-${index}`}
          style={[
            styles.horizontal,
            {
              top: `${14 + index * 20}%`,
              backgroundColor: theme.mode === "dark" ? "#111111" : "#D9D3CB",
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  vertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
  },
  horizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
  },
});
