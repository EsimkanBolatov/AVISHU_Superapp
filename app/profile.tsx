import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { MonoButton } from "../src/components/MonoButton";
import { OrderTracker } from "../src/components/OrderTracker";
import { Panel } from "../src/components/Panel";
import { ScreenShell } from "../src/components/ScreenShell";
import { SectionHeading } from "../src/components/SectionHeading";
import { StatusPill } from "../src/components/StatusPill";
import { ThemeSwitch } from "../src/components/ThemeSwitch";
import { referenceTechJacket } from "../src/lib/brandArt";
import { useResolvedTheme } from "../src/lib/theme";
import { useAppStore } from "../src/store/useAppStore";

export default function ProfileScreen() {
  const theme = useResolvedTheme();
  const user = useAppStore((state) => state.user);
  const activeOrder = useAppStore((state) => state.activeOrder);
  const tryOnSessions = useAppStore((state) => state.tryOnSessions);
  const logout = useAppStore((state) => state.logout);

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <ScreenShell title="PROFILE" subtitle="ACCOUNT / PREFERENCES / HISTORY">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.identity}>
          <View style={styles.identityGrid}>
            <View style={styles.identityCopy}>
              <StatusPill label={`${user.role.toUpperCase()} ACCOUNT / LIVE SESSION`} tone="solid" />
              <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
                {user.name.toUpperCase()}
              </Text>
              <Text style={[styles.role, { color: theme.colors.textSecondary }]}>
                {user.email} / {user.phone ?? "NO PHONE"}
              </Text>

              <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${user.loyaltyProgress}%`,
                      backgroundColor: theme.colors.accent,
                    },
                  ]}
                />
              </View>

              <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
                LOYALTY / {user.loyaltyProgress}% TO NEXT TIER
              </Text>
            </View>

            <View style={[styles.identityVisual, { borderColor: theme.colors.borderSoft }]}>
              <View style={[styles.visualGlow, { backgroundColor: theme.colors.glow }]} />
              <Image
                source={user.avatarUrl ? { uri: user.avatarUrl } : referenceTechJacket}
                style={styles.visualImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </Panel>

        <View style={styles.grid}>
          <Panel style={styles.settingsPanel}>
            <SectionHeading
              title="THEME"
              subtitle="Manual light and dark switching remains available globally."
              compact
            />
            <ThemeSwitch />
          </Panel>

          <Panel style={styles.settingsPanel}>
            <SectionHeading
              title="ACCOUNT STATE"
              subtitle="Real auth session, stored account email and role-specific workspace access."
              compact
            />
            <View style={styles.metaBlock}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>ROLE</Text>
              <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>
                {user.role.toUpperCase()}
              </Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>TRY-ON SESSIONS</Text>
              <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>
                {tryOnSessions.length}
              </Text>
            </View>
          </Panel>
        </View>

        {user.role === "client" ? (
          <Panel>
            <SectionHeading
              title="AI TRY-ON HISTORY"
              subtitle="Saved previews and generated results tied to the client profile."
              compact
            />
            <View style={styles.tryOnGrid}>
              {tryOnSessions.length ? (
                tryOnSessions.map((session) => (
                  <View
                    key={session.id}
                    style={[
                      styles.tryOnCard,
                      {
                        borderColor: theme.colors.borderSoft,
                        backgroundColor: theme.colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: session.resultImageUrl ?? session.sourceImageUrl }}
                      style={styles.tryOnImage}
                      resizeMode="cover"
                    />
                    <View style={styles.tryOnCopy}>
                      <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                        {session.status.toUpperCase()}
                      </Text>
                      <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>
                        {new Date(session.createdAt).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.tryOnText, { color: theme.colors.textSecondary }]}>
                        {session.notes}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.tryOnText, { color: theme.colors.textSecondary }]}>
                  No try-on history yet. Generate your first fit preview from a product page.
                </Text>
              )}
            </View>
          </Panel>
        ) : null}

        {activeOrder ? (
          <Panel>
            <SectionHeading
              title="ORDER TRACKER"
              subtitle="Client progress updates from franchisee and atelier actions in real time."
              compact
            />
            <OrderTracker order={activeOrder} />
          </Panel>
        ) : null}

        <MonoButton
          label="SIGN OUT"
          variant="secondary"
          onPress={async () => {
            await logout();
            router.replace("/login");
          }}
        />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 24,
  },
  identity: {
    gap: 14,
  },
  identityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    alignItems: "stretch",
  },
  identityCopy: {
    flex: 1,
    minWidth: 280,
    gap: 14,
  },
  name: {
    fontFamily: "Oswald_500Medium",
    fontSize: 44,
    letterSpacing: 1.8,
  },
  role: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 12,
    letterSpacing: 1.4,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  progressText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 12,
    letterSpacing: 1.2,
  },
  identityVisual: {
    flex: 0.9,
    minWidth: 280,
    minHeight: 360,
    borderWidth: 1,
    borderRadius: 26,
    overflow: "hidden",
  },
  visualGlow: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.9,
  },
  visualImage: {
    width: "100%",
    height: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  settingsPanel: {
    flex: 1,
    minWidth: 280,
    gap: 12,
  },
  metaBlock: {
    gap: 4,
  },
  metaLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  metaValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    letterSpacing: 0.8,
  },
  tryOnGrid: {
    gap: 12,
  },
  tryOnCard: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  tryOnImage: {
    width: "100%",
    height: 220,
  },
  tryOnCopy: {
    padding: 16,
    gap: 8,
  },
  tryOnText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
});
