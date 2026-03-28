import { router, useLocalSearchParams } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

import { MonoButton } from "../../../src/components/MonoButton";
import { Panel } from "../../../src/components/Panel";
import { ScreenShell } from "../../../src/components/ScreenShell";
import { SectionHeading } from "../../../src/components/SectionHeading";
import { StatusPill } from "../../../src/components/StatusPill";
import { referenceTechJacket } from "../../../src/lib/brandArt";
import { useResolvedTheme } from "../../../src/lib/theme";
import { useRequireRole } from "../../../src/lib/useRequireRole";
import { useAppStore } from "../../../src/store/useAppStore";

export default function CheckoutScreen() {
  const redirect = useRequireRole("client");
  const theme = useResolvedTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const orders = useAppStore((state) => state.orders);

  if (redirect) {
    return redirect;
  }

  const order = orders.find((item) => item.id === params.id);

  return (
    <ScreenShell title="PAYMENT" subtitle="CONFIRMATION" profileRoute="/profile">
      <View style={styles.container}>
        <Panel style={styles.panel}>
          <View style={styles.header}>
            <StatusPill label="ORDER LOCKED / LIVE SYNC" tone="solid" />
            <Text style={[styles.headerMeta, { color: theme.colors.textMuted }]}>
              CLIENT FLOW / NEXT STAGE READY
            </Text>
          </View>

          <View style={styles.grid}>
            <View style={[styles.visual, { borderColor: theme.colors.borderSoft }]}>
              <View style={[styles.visualGlow, { backgroundColor: theme.colors.glow }]} />
              <Image source={referenceTechJacket} style={styles.visualImage} resizeMode="cover" />
            </View>

            <View style={styles.copyBlock}>
              <SectionHeading
                title="ORDER CONFIRMED"
                subtitle="The payment step can stay simple for now, but the order is already written to the live workflow and visible to the business role."
              />

              <Text style={[styles.orderCode, { color: theme.colors.textPrimary }]}>
                {order?.number ?? params.id}
              </Text>

              <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>
                The franchisee can now dispatch the order into production, and every status update
                will flow back to the client profile in real time.
              </Text>

              <View style={styles.infoRows}>
                <View style={[styles.infoRow, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>STATUS</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>
                    PENDING FRANCHISEE
                  </Text>
                </View>

                <View style={[styles.infoRow, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>NEXT ROLE</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>
                    FRANCHISEE CONTROL TOWER
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <MonoButton label="OPEN PROFILE" onPress={() => router.push("/profile")} />
                <MonoButton
                  label="BACK TO CLIENT"
                  variant="secondary"
                  onPress={() => router.replace("/client")}
                />
              </View>
            </View>
          </View>
        </Panel>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },
  panel: {
    maxWidth: 1080,
    alignSelf: "center",
    width: "100%",
    gap: 18,
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  headerMeta: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  visual: {
    flex: 0.9,
    minWidth: 300,
    minHeight: 480,
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
  },
  visualGlow: {
    position: "absolute",
    top: -50,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 999,
    opacity: 0.9,
  },
  visualImage: {
    position: "absolute",
    right: -40,
    bottom: 0,
    width: 360,
    height: 520,
  },
  copyBlock: {
    flex: 1,
    minWidth: 300,
    gap: 18,
  },
  orderCode: {
    fontFamily: "Oswald_500Medium",
    fontSize: 54,
    letterSpacing: 2,
  },
  copy: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  infoRows: {
    gap: 10,
  },
  infoRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 6,
  },
  infoLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  infoValue: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
