import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { MonoButton } from "../../src/components/MonoButton";
import { Panel } from "../../src/components/Panel";
import { ScreenShell } from "../../src/components/ScreenShell";
import { SectionHeading } from "../../src/components/SectionHeading";
import { StatusPill } from "../../src/components/StatusPill";
import { useResolvedTheme } from "../../src/lib/theme";
import { useRequireRole } from "../../src/lib/useRequireRole";
import { useAppStore } from "../../src/store/useAppStore";

export default function ProductionScreen() {
  const redirect = useRequireRole("production");
  const theme = useResolvedTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const orders = useAppStore((state) => state.orders);
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);

  if (redirect) {
    return redirect;
  }

  const queue = orders.filter((order) => order.status === "in_production");

  return (
    <ScreenShell title="ATELIER TABLET" subtitle="PRODUCTION QUEUE" profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.leadPanel}>
          <StatusPill
            label={isWide ? "LANDSCAPE-FIRST LAYOUT" : "COMPACT MOBILE LAYOUT"}
            tone="solid"
          />
          <Text style={[styles.leadTitle, { color: theme.colors.textPrimary }]}>
            LARGE CONTROLS. LOW TEXT. HIGH CONTRAST.
          </Text>
          <Text style={[styles.leadCopy, { color: theme.colors.textSecondary }]}>
            This screen is optimized for the atelier operator: oversized cards, reduced visual
            noise and one clear action to complete the production stage.
          </Text>
        </Panel>

        <View style={styles.queue}>
          {queue.map((order) => (
            <Panel key={order.id} style={[styles.taskCard, isWide && styles.taskCardWide]}>
              <SectionHeading title={order.productName.toUpperCase()} subtitle={order.number} compact />
              <View style={styles.taskMeta}>
                <Text style={[styles.taskText, { color: theme.colors.textSecondary }]}>
                  CLIENT / {order.customerName}
                </Text>
                <Text style={[styles.taskText, { color: theme.colors.textSecondary }]}>
                  NOTES / {order.notes}
                </Text>
              </View>
              <MonoButton
                label="COMPLETE STAGE"
                size="large"
                onPress={() => updateOrderStatus(order.id, "ready")}
              />
            </Panel>
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 24,
  },
  leadPanel: {
    gap: 14,
  },
  leadTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: 1.2,
  },
  leadCopy: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 760,
  },
  queue: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  taskCard: {
    flexBasis: 300,
    flexGrow: 1,
    gap: 18,
    minHeight: 240,
    justifyContent: "space-between",
  },
  taskCardWide: {
    flexBasis: 420,
  },
  taskMeta: {
    gap: 10,
  },
  taskText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 14,
    letterSpacing: 0.6,
  },
});
