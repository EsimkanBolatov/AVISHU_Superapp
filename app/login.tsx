import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChoiceChip } from "../src/components/ChoiceChip";
import { MonoButton } from "../src/components/MonoButton";
import { MonoInput } from "../src/components/MonoInput";
import { Panel } from "../src/components/Panel";
import { StatusPill } from "../src/components/StatusPill";
import { ThemeSwitch } from "../src/components/ThemeSwitch";
import { referenceTechJacket } from "../src/lib/brandArt";
import { useResolvedTheme } from "../src/lib/theme";
import { useAppStore } from "../src/store/useAppStore";

const ACCESS_PRESETS = [
  {
    label: "CLIENT",
    email: "client@avishu.kz",
    password: "Client123!",
  },
  {
    label: "FRANCHISEE",
    email: "franchisee@avishu.kz",
    password: "Franchisee123!",
  },
  {
    label: "PRODUCTION",
    email: "production@avishu.kz",
    password: "Production123!",
  },
];

export default function LoginScreen() {
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const login = useAppStore((state) => state.login);
  const register = useAppStore((state) => state.register);
  const isLoading = useAppStore((state) => state.isLoading);
  const user = useAppStore((state) => state.user);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("client@avishu.kz");
  const [password, setPassword] = useState("Client123!");
  const [error, setError] = useState<string | null>(null);

  const routeByRole = () => {
    const currentUser = useAppStore.getState().user ?? user;

    if (!currentUser) {
      return;
    }

    router.replace(
      currentUser.role === "client"
        ? "/client"
        : currentUser.role === "franchisee"
          ? "/franchisee"
          : "/production",
    );
  };

  const handleSubmit = async () => {
    setError(null);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }

      routeByRole();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed.");
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <MonoButton label="BACK TO LANDING" variant="secondary" onPress={() => router.replace("/")} />
          <View style={styles.topbarRight}>
            <View style={styles.localeRow}>
              {(["ru", "kk", "en"] as const).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setLanguage(item)}
                  style={[
                    styles.localeChip,
                    {
                      backgroundColor:
                        language === item ? theme.colors.accent : theme.colors.surface,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.localeText,
                      {
                        color:
                          language === item
                            ? theme.colors.accentContrast
                            : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {item.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
            <ThemeSwitch />
          </View>
        </View>

        <View style={styles.grid}>
          <Panel style={styles.leftPanel}>
            <StatusPill label="REAL AUTH / SESSION FLOW" tone="solid" />
            <Text style={[styles.brand, { color: theme.colors.textPrimary }]}>AVISHU</Text>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              SIGN IN THROUGH REAL ACCOUNT ACCESS, NOT DEMO ROLE SWITCHING
            </Text>
            <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>
              The project now uses email and password sessions. Registration creates a real client
              account, while seeded business accounts let us validate franchisee and atelier flows.
            </Text>

            <View style={styles.modeRow}>
              <ChoiceChip label="SIGN IN" active={mode === "login"} onPress={() => setMode("login")} />
              <ChoiceChip
                label="REGISTER"
                active={mode === "register"}
                onPress={() => setMode("register")}
              />
            </View>

            <View style={styles.form}>
              {mode === "register" ? (
                <MonoInput
                  label="NAME"
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                />
              ) : null}
              <MonoInput
                label="EMAIL"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="client@avishu.kz"
              />
              <MonoInput
                label="PASSWORD"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Minimum 8 characters"
              />
            </View>

            {error ? <Text style={[styles.error, { color: "#B3261E" }]}>{error}</Text> : null}

            <MonoButton
              label={isLoading ? "PROCESSING..." : mode === "login" ? "ENTER SYSTEM" : "CREATE ACCOUNT"}
              onPress={handleSubmit}
            />

            <View style={styles.presetBlock}>
              <Text style={[styles.presetLabel, { color: theme.colors.textMuted }]}>
                SEEDED ACCESS FOR QA
              </Text>
              <View style={styles.presetList}>
                {ACCESS_PRESETS.map((preset) => (
                  <Pressable
                    key={preset.label}
                    onPress={() => {
                      setMode("login");
                      setEmail(preset.email);
                      setPassword(preset.password);
                    }}
                    style={[
                      styles.presetCard,
                      {
                        borderColor: theme.colors.borderSoft,
                        backgroundColor: theme.colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Text style={[styles.presetTitle, { color: theme.colors.textPrimary }]}>
                      {preset.label}
                    </Text>
                    <Text style={[styles.presetText, { color: theme.colors.textSecondary }]}>
                      {preset.email}
                    </Text>
                    <Text style={[styles.presetText, { color: theme.colors.textMuted }]}>
                      {preset.password}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Panel>

          <Panel style={styles.rightPanel}>
            <View style={[styles.visualGlow, { backgroundColor: theme.colors.glow }]} />
            <Text style={[styles.visualMeta, { color: theme.colors.textMuted }]}>
              PRODUCT PLATFORM / CREDENTIAL ACCESS / OPERATIONAL DEPTH
            </Text>
            <Text style={[styles.visualTitle, { color: theme.colors.textPrimary }]}>
              ACCOUNT LAYER, CATALOG SYSTEM, TRY-ON PIPELINE AND BUSINESS OPERATIONS
            </Text>
            <View style={styles.visualFrame}>
              <View style={[styles.visualImageWrap, { borderColor: theme.colors.borderSoft }]}>
                <View style={[styles.visualImageInner, { backgroundColor: theme.colors.surfaceSecondary }]}>
                  <Image source={referenceTechJacket} style={styles.imageFill} resizeMode="cover" />
                  <View
                    style={[
                      styles.visualVeil,
                      {
                        backgroundColor: theme.colors.backgroundSecondary,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
            <View style={styles.visualChecklist}>
              {[
                "Client registration and persistent auth session.",
                "Franchisee catalog CRUD and order control.",
                "Production queue with stage progression and files.",
              ].map((item) => (
                <View key={item} style={[styles.checkRow, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.checkText, { color: theme.colors.textSecondary }]}>{item}</Text>
                </View>
              ))}
            </View>
          </Panel>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 18,
  },
  topbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  topbarRight: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  localeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  localeChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  localeText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  leftPanel: {
    flex: 1.08,
    minWidth: 340,
    gap: 16,
  },
  rightPanel: {
    flex: 0.92,
    minWidth: 320,
    minHeight: 980,
    gap: 16,
    overflow: "hidden",
  },
  brand: {
    fontFamily: "Oswald_500Medium",
    fontSize: 74,
    letterSpacing: 3.2,
  },
  title: {
    maxWidth: 640,
    fontFamily: "Oswald_500Medium",
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: 0.7,
  },
  copy: {
    maxWidth: 620,
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 25,
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  form: {
    gap: 12,
  },
  error: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    lineHeight: 20,
  },
  presetBlock: {
    gap: 10,
    paddingTop: 6,
  },
  presetLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  presetList: {
    gap: 10,
  },
  presetCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 6,
  },
  presetTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    letterSpacing: 0.8,
  },
  presetText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  visualGlow: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 360,
    height: 360,
    borderRadius: 999,
    opacity: 0.85,
  },
  visualMeta: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
  visualTitle: {
    maxWidth: 360,
    fontFamily: "Oswald_500Medium",
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: 0.7,
  },
  visualFrame: {
    flex: 1,
  },
  visualImageWrap: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  visualImageInner: {
    flex: 1,
    overflow: "hidden",
  },
  imageFill: {
    position: "absolute",
    right: -320,
    bottom: -54,
    width: 1120,
    height: 1040,
    transform: [{ scale: 1.06 }],
  },
  visualVeil: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "26%",
    opacity: 0.82,
  },
  visualChecklist: {
    gap: 10,
  },
  checkRow: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  checkText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    lineHeight: 22,
  },
});
