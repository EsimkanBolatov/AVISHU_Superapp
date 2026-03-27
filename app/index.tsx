import { Redirect, router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MonoButton } from "../src/components/MonoButton";
import { Panel } from "../src/components/Panel";
import { SectionHeading } from "../src/components/SectionHeading";
import { StatusPill } from "../src/components/StatusPill";
import { ThemeSwitch } from "../src/components/ThemeSwitch";
import { useResolvedTheme } from "../src/lib/theme";
import { useAppStore } from "../src/store/useAppStore";

const PILLARS = [
  {
    title: "MONOCHROME WARDROBE",
    copy: "Tailoring, dresses, shirts and sharp layers assembled into one strict visual language.",
  },
  {
    title: "ATELIER RHYTHM",
    copy: "Ready-to-wear and preorder live in one system, so the brand feels premium and operationally clear.",
  },
  {
    title: "CITY-LED EDITORIAL",
    copy: "The store is built like a magazine spread: contrast, negative space, typography and calm confidence.",
  },
];

const JOURNEY = [
  "DISCOVER curated looks and key silhouettes.",
  "CHOOSE ready-to-wear or preorder format.",
  "TRACK the atelier status in real time.",
  "RETURN for loyalty growth and future drops.",
];

export default function IndexScreen() {
  const user = useAppStore((state) => state.user);
  const theme = useResolvedTheme();

  if (user?.role === "client") {
    return <Redirect href="/client" />;
  }

  if (user?.role === "franchisee") {
    return <Redirect href="/franchisee" />;
  }

  if (user?.role === "production") {
    return <Redirect href="/production" />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <StatusPill label="AVISHU / STORE LANDING" tone="solid" />
          <ThemeSwitch />
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={[styles.brand, { color: theme.colors.textPrimary }]}>AVISHU</Text>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              A STORE FOR STRICT TAILORING, QUIET LUXURY AND MONOCHROME CONFIDENCE
            </Text>
            <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>
              AVISHU is a fashion space where editorial styling meets real atelier workflow. The
              store combines clean silhouettes, premium blacks and whites, preorder mechanics and a
              loyalty rhythm for returning clients.
            </Text>
            <View style={styles.ctaRow}>
              <MonoButton label="ENTER DEMO" onPress={() => router.push("/login")} />
              <MonoButton label="OPEN VITRINA" variant="secondary" onPress={() => router.push("/login")} />
            </View>
          </View>

          <Panel style={styles.heroPanel}>
            <Text style={[styles.panelLabel, { color: theme.colors.textMuted }]}>STORE CODE</Text>
            <Text style={[styles.panelValue, { color: theme.colors.textPrimary }]}>BLACK / WHITE / SPACE</Text>
            <Text style={[styles.panelText, { color: theme.colors.textSecondary }]}>
              The brand language is built around contrast, structure, long silhouettes and
              intentional restraint instead of loud decoration.
            </Text>
          </Panel>
        </View>

        <View style={styles.pillarGrid}>
          {PILLARS.map((pillar) => (
            <Panel key={pillar.title} style={styles.pillarCard}>
              <SectionHeading title={pillar.title} subtitle={pillar.copy} compact />
            </Panel>
          ))}
        </View>

        <View style={styles.editorialRow}>
          <Panel style={styles.editorialMain}>
            <SectionHeading
              title="WHAT THE STORE SELLS"
              subtitle="Outerwear, dresses, suits and studio separates designed to be mixed into precise monochrome capsules."
            />
            <Text style={[styles.editorialText, { color: theme.colors.textSecondary }]}>
              The shopping experience balances immediate buying with preorder logic. This lets the
              storefront feel premium for clients while remaining production-aware behind the scene.
            </Text>
          </Panel>

          <Panel style={styles.editorialSide}>
            <Text style={[styles.panelLabel, { color: theme.colors.textMuted }]}>CLIENT JOURNEY</Text>
            <View style={styles.journeyList}>
              {JOURNEY.map((item, index) => (
                <View key={item} style={styles.journeyRow}>
                  <Text style={[styles.journeyIndex, { color: theme.colors.textMuted }]}>
                    0{index + 1}
                  </Text>
                  <Text style={[styles.journeyText, { color: theme.colors.textSecondary }]}>
                    {item}
                  </Text>
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
    gap: 20,
  },
  topbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  hero: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    alignItems: "stretch",
  },
  heroCopy: {
    flex: 2,
    minWidth: 300,
    gap: 14,
  },
  heroPanel: {
    flex: 1,
    minWidth: 280,
    gap: 14,
    justifyContent: "space-between",
  },
  brand: {
    fontFamily: "Oswald_500Medium",
    fontSize: 92,
    letterSpacing: 4,
  },
  title: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: 1.3,
    maxWidth: 760,
  },
  copy: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 760,
  },
  ctaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 10,
  },
  panelLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.6,
  },
  panelValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 1.2,
  },
  panelText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  pillarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  pillarCard: {
    flexBasis: 280,
    flexGrow: 1,
    minHeight: 180,
  },
  editorialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  editorialMain: {
    flex: 1.4,
    minWidth: 320,
    gap: 18,
  },
  editorialSide: {
    flex: 1,
    minWidth: 280,
    gap: 16,
  },
  editorialText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  journeyList: {
    gap: 12,
  },
  journeyRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  journeyIndex: {
    width: 28,
    fontFamily: "Oswald_500Medium",
    fontSize: 20,
  },
  journeyText: {
    flex: 1,
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
});
