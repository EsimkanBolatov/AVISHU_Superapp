import { StyleSheet, Text } from "react-native";

import { useResolvedTheme } from "../lib/theme";
import { Panel } from "./Panel";

export function MetricCard({ label, value }: { label: string; value: string }) {
  const theme = useResolvedTheme();

  return (
    <Panel style={styles.panel}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}</Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    minWidth: 220,
    minHeight: 120,
    justifyContent: "space-between",
  },
  label: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.6,
  },
  value: {
    fontFamily: "Oswald_500Medium",
    fontSize: 40,
    letterSpacing: 1.2,
  },
});
