import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MonoButton } from "../src/components/MonoButton";
import { OrderTracker } from "../src/components/OrderTracker";
import { Panel } from "../src/components/Panel";
import { ScreenShell } from "../src/components/ScreenShell";
import { SectionHeading } from "../src/components/SectionHeading";
import { StatusPill } from "../src/components/StatusPill";
import { referenceTechJacket } from "../src/lib/brandArt";
import { useResolvedTheme } from "../src/lib/theme";
import { useAppStore } from "../src/store/useAppStore";
import { AppLanguage, Role, ThemePreference } from "../src/types";

const THEME_OPTIONS: ThemePreference[] = ["system", "light", "dark"];
const LANGUAGE_OPTIONS: AppLanguage[] = ["ru", "kk", "en"];
const ROLE_OPTIONS: Role[] = ["client", "franchisee", "production"];

export default function ProfileScreen() {
  const theme = useResolvedTheme();
  const user = useAppStore((state) => state.user);
  const themePreference = useAppStore((state) => state.themePreference);
  const language = useAppStore((state) => state.language);
  const activeOrder = useAppStore((state) => state.activeOrder);
  const setThemePreference = useAppStore((state) => state.setThemePreference);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const login = useAppStore((state) => state.login);
  const logout = useAppStore((state) => state.logout);

  if (!user) {
    router.replace("/login");
    return null;
  }

  const handleRoleSwitch = async (role: Role) => {
    await login(role);
    router.replace(
      role === "client" ? "/client" : role === "franchisee" ? "/franchisee" : "/production",
    );
  };

  return (
    <ScreenShell title="PROFILE" subtitle="SETTINGS / LOYALTY / TRACKING">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.identity}>
          <View style={styles.identityGrid}>
            <View style={styles.identityCopy}>
              <StatusPill label="CLIENT PROFILE / LIVE PREFERENCES" tone="solid" />
              <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
                {user.name.toUpperCase()}
              </Text>
              <Text style={[styles.role, { color: theme.colors.textSecondary }]}>
                ROLE / {user.role.toUpperCase()}
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
              <Image source={referenceTechJacket} style={styles.visualImage} resizeMode="cover" />
            </View>
          </View>
        </Panel>

        <View style={styles.grid}>
          <Panel style={styles.settingsPanel}>
            <SectionHeading
              title="THEME"
              subtitle="System, light or dark mode with manual switching."
              compact
            />
            <View style={styles.optionRow}>
              {THEME_OPTIONS.map((option) => (
                <Chip
                  key={option}
                  label={option.toUpperCase()}
                  active={themePreference === option}
                  onPress={() => setThemePreference(option)}
                />
              ))}
            </View>
          </Panel>

          <Panel style={styles.settingsPanel}>
            <SectionHeading
              title="LANGUAGE"
              subtitle="RU / KK / EN preference, ready for future localization."
              compact
            />
            <View style={styles.optionRow}>
              {LANGUAGE_OPTIONS.map((option) => (
                <Chip
                  key={option}
                  label={option.toUpperCase()}
                  active={language === option}
                  onPress={() => setLanguage(option)}
                />
              ))}
            </View>
          </Panel>
        </View>

        <Panel>
          <SectionHeading
            title="DEMO ROLE SWITCH"
            subtitle="Fast validation of all three role scenarios from one local build."
            compact
          />
          <View style={styles.optionRow}>
            {ROLE_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option.toUpperCase()}
                active={user.role === option}
                onPress={() => handleRoleSwitch(option)}
              />
            ))}
          </View>
        </Panel>

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
          onPress={() => {
            logout();
            router.replace("/login");
          }}
        />
      </ScrollView>
    </ScreenShell>
  );
}

function Chip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const theme = useResolvedTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: theme.colors.borderSoft,
          backgroundColor: active ? theme.colors.accent : theme.colors.surfaceSecondary,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: active ? theme.colors.accentContrast : theme.colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
    position: "absolute",
    right: -30,
    bottom: -20,
    width: 330,
    height: 400,
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
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
  },
});
