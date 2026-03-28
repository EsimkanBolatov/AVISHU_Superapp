import { Redirect, router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MonoButton } from "../src/components/MonoButton";
import { Panel } from "../src/components/Panel";
import { StatusPill } from "../src/components/StatusPill";
import { ThemeSwitch } from "../src/components/ThemeSwitch";
import { referenceTechJacket } from "../src/lib/brandArt";
import { useResolvedTheme } from "../src/lib/theme";
import { useAppStore } from "../src/store/useAppStore";

const FEATURE_ROWS = [
  ["ULTRA CLEAN SHELL", "Layered premium outerwear and tech-tailoring silhouettes."],
  ["AI FIT / COMMERCE READY", "Try-on, preorder and ready-stock flows in one premium interface."],
  ["STORE TO ATELIER LOOP", "Client, franchisee and production roles share one live order spine."],
];

const SYSTEM_ROWS = [
  "01 / PREMIUM OUTERWEAR",
  "02 / PREORDER MECHANICS",
  "03 / TECHNICAL PRODUCT STORY",
  "04 / MONOCHROME EXPERIENCE",
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
          <View style={styles.topbarLeft}>
            <Text style={[styles.logo, { color: theme.colors.textPrimary }]}>AVISHU</Text>
            <Text style={[styles.topbarMeta, { color: theme.colors.textMuted }]}>
              FUTURE OUTERWEAR / COMMERCE SYSTEM
            </Text>
          </View>
          <View style={styles.topbarRight}>
            <ThemeSwitch />
            <StatusPill label="LIVE PROTOTYPE / 2026" tone="ghost" />
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <StatusPill label="REFERENCE DIRECTION / TECH RETAIL" tone="solid" />
            <Text style={[styles.kicker, { color: theme.colors.textMuted }]}>AVISHU SYSTEM DROP</Text>
            <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
              FUTURE OUTERWEAR STORE WITH PRODUCT STORY, FIT TECH AND LIVE ORDER OPERATIONS
            </Text>
            <Text style={[styles.heroCopy, { color: theme.colors.textSecondary }]}>
              The next version of AVISHU should feel closer to Krakatau, Acronym and advanced
              editorial retail than to a generic marketplace. We shift from demo cards to a cold,
              precise, image-led commerce experience.
            </Text>

            <View style={styles.heroActions}>
              <MonoButton label="ENTER EXPERIENCE" onPress={() => router.push("/login")} />
              <MonoButton label="OPEN CLIENT VITRINA" variant="secondary" onPress={() => router.push("/login")} />
            </View>

            <View style={styles.systemList}>
              {SYSTEM_ROWS.map((item) => (
                <View
                  key={item}
                  style={[styles.systemRow, { borderColor: theme.colors.borderSoft }]}
                >
                  <Text style={[styles.systemText, { color: theme.colors.textSecondary }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Panel style={styles.heroVisual}>
            <View style={[styles.heroGlow, { backgroundColor: theme.colors.glow }]} />
            <Image source={referenceTechJacket} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroOverlayTop}>
              <Text style={[styles.visualLabel, { color: theme.colors.textMuted }]}>
                STORM SHELL / VISUAL REFERENCE
              </Text>
              <Text style={[styles.visualStats, { color: theme.colors.textPrimary }]}>XS - XL</Text>
            </View>
            <View style={styles.heroOverlayBottom}>
              <Text style={[styles.visualHeadline, { color: theme.colors.textPrimary }]}>
                AI TRY-ON / PRODUCT DETAIL / HIGH-END COMMERCE
              </Text>
            </View>
          </Panel>
        </View>

        <View style={styles.featureGrid}>
          {FEATURE_ROWS.map(([title, copy]) => (
            <Panel key={title} style={styles.featureCard}>
              <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
              <Text style={[styles.featureCopy, { color: theme.colors.textSecondary }]}>{copy}</Text>
            </Panel>
          ))}
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
    paddingBottom: 44,
    gap: 18,
  },
  topbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  topbarLeft: {
    gap: 4,
  },
  topbarRight: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  logo: {
    fontFamily: "Oswald_500Medium",
    fontSize: 28,
    letterSpacing: 2.4,
  },
  topbarMeta: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
  hero: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    alignItems: "stretch",
  },
  heroLeft: {
    flex: 1.05,
    minWidth: 320,
    gap: 14,
    justifyContent: "space-between",
  },
  kicker: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
  heroTitle: {
    maxWidth: 680,
    fontFamily: "Oswald_500Medium",
    fontSize: 58,
    lineHeight: 62,
    letterSpacing: 0.6,
  },
  heroCopy: {
    maxWidth: 620,
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 25,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 6,
  },
  systemList: {
    gap: 10,
    paddingTop: 10,
  },
  systemRow: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  systemText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    letterSpacing: 0.9,
  },
  heroVisual: {
    flex: 1,
    minWidth: 340,
    minHeight: 760,
    justifyContent: "space-between",
    padding: 0,
  },
  heroGlow: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 440,
    height: 440,
    borderRadius: 999,
    opacity: 0.82,
  },
  heroImage: {
    position: "absolute",
    right: -46,
    bottom: 0,
    width: 520,
    height: 760,
  },
  heroOverlayTop: {
    paddingHorizontal: 22,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  heroOverlayBottom: {
    paddingHorizontal: 22,
    paddingBottom: 22,
    maxWidth: 340,
  },
  visualLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
  visualStats: {
    fontFamily: "Oswald_500Medium",
    fontSize: 22,
    letterSpacing: 1,
  },
  visualHeadline: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.7,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  featureCard: {
    flexBasis: 280,
    flexGrow: 1,
    minHeight: 170,
    gap: 14,
  },
  featureTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: 0.8,
  },
  featureCopy: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 23,
  },
});
