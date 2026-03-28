import { router } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MonoButton } from "../src/components/MonoButton";
import { Panel } from "../src/components/Panel";
import { StatusPill } from "../src/components/StatusPill";
import { ThemeSwitch } from "../src/components/ThemeSwitch";
import { referenceTechJacket } from "../src/lib/brandArt";
import { useResolvedTheme } from "../src/lib/theme";
import { useAppStore } from "../src/store/useAppStore";
import { Role } from "../src/types";

const ROLES: Array<{
  role: Role;
  label: string;
  meta: string;
  copy: string;
}> = [
  {
    role: "client",
    label: "CLIENT",
    meta: "STORE FRONT",
    copy: "Product discovery, purchase, preorder scheduling and live order tracking.",
  },
  {
    role: "franchisee",
    label: "FRANCHISEE",
    meta: "CONTROL TOWER",
    copy: "Revenue dashboard, incoming order queue and production dispatch layer.",
  },
  {
    role: "production",
    label: "PRODUCTION",
    meta: "ATELIER TABLET",
    copy: "Large controls, task queue and stage completion for garment execution.",
  },
];

export default function LoginScreen() {
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const login = useAppStore((state) => state.login);
  const isLoading = useAppStore((state) => state.isLoading);

  const handleLogin = async (role: Role) => {
    await login(role);
    router.replace(role === "client" ? "/client" : role === "franchisee" ? "/franchisee" : "/production");
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
            <StatusPill label="ACCESS / ROLE GATE" tone="solid" />
            <Text style={[styles.brand, { color: theme.colors.textPrimary }]}>AVISHU</Text>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              ENTER THE SYSTEM THROUGH THE ROLE YOU WANT TO VALIDATE
            </Text>
            <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>
              This should become a real authentication and routing gateway, but for now it works as
              a clear multi-role entry to validate client, business and atelier UX.
            </Text>

            <View style={styles.roleList}>
              {ROLES.map((item) => (
                <Panel key={item.role} style={styles.roleCard}>
                  <View style={styles.roleHead}>
                    <Text style={[styles.roleMeta, { color: theme.colors.textMuted }]}>
                      {item.meta}
                    </Text>
                    <Text style={[styles.roleLabel, { color: theme.colors.textPrimary }]}>
                      {item.label}
                    </Text>
                  </View>
                  <Text style={[styles.roleCopy, { color: theme.colors.textSecondary }]}>
                    {item.copy}
                  </Text>
                  <MonoButton
                    label={isLoading ? "OPENING..." : `ENTER AS ${item.label}`}
                    onPress={() => handleLogin(item.role)}
                  />
                </Panel>
              ))}
            </View>

            {isLoading ? (
              <View style={styles.loaderRow}>
                <ActivityIndicator color={theme.colors.textPrimary} />
              </View>
            ) : null}
          </Panel>

          <Panel style={styles.rightPanel}>
            <View style={[styles.visualGlow, { backgroundColor: theme.colors.glow }]} />
            <Text style={[styles.visualMeta, { color: theme.colors.textMuted }]}>
              FUTURE COMMERCE REFERENCE / COLD RETAIL SYSTEM
            </Text>
            <Text style={[styles.visualTitle, { color: theme.colors.textPrimary }]}>
              IMAGE-LED UI, STRICT TYPE AND OPERATIONAL DEPTH
            </Text>
            <View style={styles.visualFrame}>
              <View style={[styles.visualImageWrap, { borderColor: theme.colors.borderSoft }]}>
                <View style={[styles.visualImageInner, { backgroundColor: theme.colors.surfaceSecondary }]}>
                  <Image source={referenceTechJacket} style={styles.imageFill} resizeMode="cover" />
                </View>
              </View>
            </View>
            <View style={styles.visualChecklist}>
              {[
                "Replace generic cards with image-first product modules.",
                "Elevate typography hierarchy to premium editorial retail level.",
                "Move from MVP feel to branded system concept.",
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
  roleList: {
    gap: 12,
  },
  roleCard: {
    gap: 14,
  },
  roleHead: {
    gap: 6,
  },
  roleMeta: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  roleLabel: {
    fontFamily: "Oswald_500Medium",
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0.9,
  },
  roleCopy: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 23,
  },
  loaderRow: {
    paddingTop: 4,
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
    width: "118%",
    height: "100%",
    alignSelf: "flex-end",
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
