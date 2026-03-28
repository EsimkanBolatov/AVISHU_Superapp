import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { MetricCard } from "../../src/components/MetricCard";
import { MonoButton } from "../../src/components/MonoButton";
import { Panel } from "../../src/components/Panel";
import { ScreenShell } from "../../src/components/ScreenShell";
import { SectionHeading } from "../../src/components/SectionHeading";
import { StatusPill } from "../../src/components/StatusPill";
import { useResolvedTheme } from "../../src/lib/theme";
import { useRequireRole } from "../../src/lib/useRequireRole";
import { useAppStore } from "../../src/store/useAppStore";
import { Order } from "../../src/types";

type MobileTab = "overview" | "orders" | "profile";

export default function FranchiseeScreen() {
  const redirect = useRequireRole("franchisee");
  const theme = useResolvedTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [mobileTab, setMobileTab] = useState<MobileTab>("orders");

  const metrics = useAppStore((state) => state.metrics);
  const orders = useAppStore((state) => state.orders);
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);

  if (redirect) {
    return redirect;
  }

  const pendingOrders = orders.filter((order) => order.status === "pending_franchisee");
  const productionOrders = orders.filter((order) => order.status === "in_production");
  const readyOrders = orders.filter((order) => order.status === "ready");

  const renderColumn = (
    title: string,
    list: Order[],
    actionLabel?: string,
    nextStatus?: Order["status"],
  ) => (
    <Panel style={styles.column}>
      <View style={styles.columnHeader}>
        <SectionHeading title={title} subtitle={`${list.length} ORDERS`} compact />
      </View>

      <View style={styles.columnList}>
        {list.map((order) => (
          <Panel key={order.id} style={styles.orderCard}>
            <StatusPill label={order.number} tone="ghost" />
            <Text style={[styles.orderProduct, { color: theme.colors.textPrimary }]}>
              {order.productName}
            </Text>
            <Text style={[styles.orderMeta, { color: theme.colors.textSecondary }]}>
              {order.customerName} / {order.notes}
            </Text>
            {actionLabel && nextStatus ? (
              <MonoButton
                label={actionLabel}
                onPress={() => updateOrderStatus(order.id, nextStatus)}
              />
            ) : (
              <Text style={[styles.orderFooter, { color: theme.colors.textMuted }]}>
                LIVE STATUS / {order.status.toUpperCase()}
              </Text>
            )}
          </Panel>
        ))}
      </View>
    </Panel>
  );

  return (
    <ScreenShell title="CONTROL TOWER" subtitle="FRANCHISEE DASHBOARD" profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {(isDesktop || mobileTab === "overview") && (
          <View style={styles.metricsGrid}>
            <MetricCard label="REVENUE" value={metrics.revenue} />
            <MetricCard label="PLAN" value={metrics.plan} />
            <MetricCard label="NEW FLOW" value={String(pendingOrders.length)} />
          </View>
        )}

        {(isDesktop || mobileTab === "orders") && (
          <View style={styles.board}>
            {renderColumn("NEW", pendingOrders, "SEND TO ATELIER", "in_production")}
            {renderColumn("ATELIER", productionOrders)}
            {renderColumn("READY", readyOrders)}
          </View>
        )}

        {!isDesktop ? (
          <View
            style={[
              styles.mobileNav,
              {
                borderColor: theme.colors.borderSoft,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            {([
              ["overview", "METRICS"],
              ["orders", "ORDERS"],
              ["profile", "PROFILE"],
            ] as const).map(([key, label]) => (
              <Pressable
                key={key}
                onPress={() => {
                  setMobileTab(key);
                }}
                style={[
                  styles.mobileNavItem,
                  key === mobileTab && { backgroundColor: theme.colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.mobileNavText,
                    {
                      color:
                        key === mobileTab ? theme.colors.accentContrast : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {!isDesktop && mobileTab === "profile" ? (
          <Panel>
            <SectionHeading
              title="PROFILE SHORTCUT"
              subtitle="On mobile, the bottom navigation replaces the classic desktop control layout."
              compact
            />
            <MonoButton label="RETURN TO ORDERS" onPress={() => setMobileTab("orders")} />
          </Panel>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 24,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "flex-start",
  },
  column: {
    flex: 1,
    minWidth: 280,
    gap: 16,
  },
  columnHeader: {
    paddingBottom: 4,
  },
  columnList: {
    gap: 12,
  },
  orderCard: {
    gap: 12,
  },
  orderProduct: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    letterSpacing: 1,
  },
  orderMeta: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  orderFooter: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
  },
  mobileNav: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 22,
    padding: 6,
    gap: 6,
  },
  mobileNavItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 16,
  },
  mobileNavText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
  },
});
