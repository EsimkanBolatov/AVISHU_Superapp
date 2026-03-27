import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MonoButton } from "../src/components/MonoButton";
import { OrderTracker } from "../src/components/OrderTracker";
import { Panel } from "../src/components/Panel";
import { ScreenShell } from "../src/components/ScreenShell";
import { SectionHeading } from "../src/components/SectionHeading";
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
                  backgroundColor: theme.colors.textPrimary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
            LOYALTY / {user.loyaltyProgress}% TO NEXT TIER
          </Text>
        </Panel>

        <View style={styles.grid}>
          <Panel style={styles.settingsPanel}>
            <SectionHeading
              title="THEME"
              subtitle="Системная, светлая или темная версия."
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
              subtitle="RU / KK / EN локализация интерфейса."
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
            subtitle="Быстрая проверка всех трех сценариев в одном клиенте."
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
              subtitle="Прогресс клиента обновляется от действий франчайзи и цеха."
              compact
            />
            <OrderTracker order={activeOrder} />
          </Panel>
        ) : null}

        <MonoButton
          label="ВЫЙТИ"
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
          borderColor: theme.colors.border,
          backgroundColor: active ? theme.colors.textPrimary : theme.colors.surfaceSecondary,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: active ? theme.colors.background : theme.colors.textSecondary,
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
  },
  progressFill: {
    height: "100%",
  },
  progressText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 12,
    letterSpacing: 1.2,
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
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
  },
});
