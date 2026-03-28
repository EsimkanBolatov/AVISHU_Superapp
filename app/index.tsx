import { Redirect, router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguageSwitch } from "../src/components/LanguageSwitch";
import { MonoButton } from "../src/components/MonoButton";
import { Panel } from "../src/components/Panel";
import { StatusPill } from "../src/components/StatusPill";
import { ThemeSwitch } from "../src/components/ThemeSwitch";
import { landingHeroArt } from "../src/lib/brandArt";
import { useResolvedTheme } from "../src/lib/theme";
import { useAppStore } from "../src/store/useAppStore";
import { AppLanguage } from "../src/types";

const COPY: Record<
  AppLanguage,
  {
    meta: string;
    badge: string;
    kicker: string;
    title: string;
    body: string;
    primary: string;
    secondary: string;
    visualLabel: string;
    visualHeadline: string;
    systemRows: string[];
    featureRows: Array<[string, string]>;
  }
> = {
  ru: {
    meta: "FUTURE OUTERWEAR / COMMERCE SYSTEM",
    badge: "REFERENCE DIRECTION / TECH RETAIL",
    kicker: "AVISHU SYSTEM DROP",
    title: "ПРЕМИАЛЬНЫЙ МАГАЗИН OUTERWEAR С СИЛЬНОЙ ИСТОРИЕЙ ПРОДУКТА, FIT-TECH И ЖИВОЙ ОПЕРАЦИОННОЙ СИСТЕМОЙ",
    body: "AVISHU должен ощущаться как холодный высококлассный fashion-tech бренд. Здесь важны тишина в композиции, строгая типографика, архитектурная подача продукта и ощущение дорогого цифрового бутика.",
    primary: "ВОЙТИ В СИСТЕМУ",
    secondary: "ОТКРЫТЬ ВИТРИНУ",
    visualLabel: "EDITORIAL PRODUCT / HERO FRAME",
    visualHeadline: "AI TRY-ON / PRODUCT STORY / HIGH-END COMMERCE",
    systemRows: [
      "01 / PREMIUM OUTERWEAR",
      "02 / TRILINGUAL EXPERIENCE",
      "03 / AI FIT PIPELINE",
      "04 / STORE TO ATELIER LOOP",
    ],
    featureRows: [
      ["ПРЕМИАЛЬНАЯ ПОДАЧА", "Большие image-led блоки, спокойный ритм и дорогая визуальная дисциплина."],
      ["3 ЯЗЫКА", "Русский, казахский и английский для большего охвата клиентов."],
      ["ЕДИНЫЙ ПРОДУКТ", "Каталог, try-on, заказ и операционный цикл работают в одной системе."],
    ],
  },
  kk: {
    meta: "FUTURE OUTERWEAR / COMMERCE SYSTEM",
    badge: "REFERENCE DIRECTION / TECH RETAIL",
    kicker: "AVISHU SYSTEM DROP",
    title: "ПРЕМИУМ OUTERWEAR ДҮКЕНІ: КҮШТІ PRODUCT STORY, FIT-TECH ЖӘНЕ ТІРІ ОПЕРАЦИЯЛЫҚ ЖҮЙЕ",
    body: "AVISHU суық, жоғары класты fashion-tech бренд ретінде сезілуі керек. Композиция тыныш, типография нақты, ал өнім ұсынысы қымбат цифрлық бутик әсерін беруі тиіс.",
    primary: "ЖҮЙЕГЕ КІРУ",
    secondary: "ВИТРИНАНЫ АШУ",
    visualLabel: "EDITORIAL PRODUCT / HERO FRAME",
    visualHeadline: "AI TRY-ON / PRODUCT STORY / HIGH-END COMMERCE",
    systemRows: [
      "01 / PREMIUM OUTERWEAR",
      "02 / TRILINGUAL EXPERIENCE",
      "03 / AI FIT PIPELINE",
      "04 / STORE TO ATELIER LOOP",
    ],
    featureRows: [
      ["ПРЕМИУМ ҰСЫНЫС", "Үлкен image-led блоктар, сабырлы ритм және қымбат визуалдық тәртіп."],
      ["3 ТІЛ", "Клиенттерді кеңірек қамту үшін қазақ, орыс және ағылшын тілдері."],
      ["БІРТҰТАС ӨНІМ", "Каталог, try-on, тапсырыс және операциялық цикл бір жүйеде біріктірілген."],
    ],
  },
  en: {
    meta: "FUTURE OUTERWEAR / COMMERCE SYSTEM",
    badge: "REFERENCE DIRECTION / TECH RETAIL",
    kicker: "AVISHU SYSTEM DROP",
    title: "FUTURE OUTERWEAR STORE WITH PRODUCT STORY, FIT TECH AND LIVE ORDER OPERATIONS",
    body: "AVISHU should feel like a premium cold fashion-tech house. The interface has to stay quiet, architectural and product-led, with the precision of a high-class digital boutique rather than a generic marketplace.",
    primary: "ENTER EXPERIENCE",
    secondary: "OPEN VITRINA",
    visualLabel: "EDITORIAL PRODUCT / HERO FRAME",
    visualHeadline: "AI TRY-ON / PRODUCT STORY / HIGH-END COMMERCE",
    systemRows: [
      "01 / PREMIUM OUTERWEAR",
      "02 / TRILINGUAL EXPERIENCE",
      "03 / AI FIT PIPELINE",
      "04 / STORE TO ATELIER LOOP",
    ],
    featureRows: [
      ["PREMIUM DIRECTION", "Large image-led modules, quiet rhythm and sharper luxury visual discipline."],
      ["3 LANGUAGES", "Russian, Kazakh and English for a wider premium customer reach."],
      ["ONE PRODUCT SYSTEM", "Catalog, try-on, checkout and operations live inside one connected flow."],
    ],
  },
};

export default function IndexScreen() {
  const user = useAppStore((state) => state.user);
  const language = useAppStore((state) => state.language);
  const theme = useResolvedTheme();
  const copy = COPY[language];

  if (user?.role === "client") {
    return <Redirect href="/client" />;
  }

  if (user?.role === "franchisee") {
    return <Redirect href="/franchisee" />;
  }

  if (user?.role === "admin") {
    return <Redirect href="/admin" />;
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
            <Text style={[styles.topbarMeta, { color: theme.colors.textMuted }]}>{copy.meta}</Text>
          </View>
          <View style={styles.topbarRight}>
            <LanguageSwitch />
            <ThemeSwitch />
            <StatusPill label="LIVE PROTOTYPE / 2026" tone="ghost" />
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <StatusPill label={copy.badge} tone="solid" />
            <Text style={[styles.kicker, { color: theme.colors.textMuted }]}>{copy.kicker}</Text>
            <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>{copy.title}</Text>
            <Text style={[styles.heroCopy, { color: theme.colors.textSecondary }]}>{copy.body}</Text>

            <View style={styles.heroActions}>
              <MonoButton label={copy.primary} onPress={() => router.push("/login")} />
              <MonoButton label={copy.secondary} variant="secondary" onPress={() => router.push("/login")} />
            </View>

            <View style={styles.systemList}>
              {copy.systemRows.map((item) => (
                <View key={item} style={[styles.systemRow, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.systemText, { color: theme.colors.textSecondary }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <Panel style={styles.heroVisual}>
            <View
              style={[
                styles.heroGlow,
                {
                  backgroundColor: theme.colors.glow,
                },
              ]}
            />
            <View style={[styles.imageMask, { backgroundColor: theme.colors.surfaceSecondary }]}>
              <Image source={landingHeroArt} style={styles.heroImage} resizeMode="cover" />
              <View style={[styles.imageVeil, { backgroundColor: theme.colors.backgroundSecondary }]} />
            </View>
            <View style={styles.heroOverlayTop}>
              <Text style={[styles.visualLabel, { color: theme.colors.textMuted }]}>{copy.visualLabel}</Text>
              <Text style={[styles.visualStats, { color: theme.colors.textPrimary }]}>XS - XL</Text>
            </View>
            <View style={styles.heroOverlayBottom}>
              <Text style={[styles.visualHeadline, { color: theme.colors.textPrimary }]}>
                {copy.visualHeadline}
              </Text>
            </View>
          </Panel>
        </View>

        <View style={styles.featureGrid}>
          {copy.featureRows.map(([title, body]) => (
            <Panel key={title} style={styles.featureCard}>
              <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
              <Text style={[styles.featureCopy, { color: theme.colors.textSecondary }]}>{body}</Text>
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
    maxWidth: 720,
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
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 440,
    height: 440,
    borderRadius: 999,
    opacity: 0.72,
  },
  imageMask: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
  },
  heroImage: {
    position: "absolute",
    right: -260,
    bottom: -34,
    width: 1180,
    height: 880,
    transform: [{ scale: 1.08 }],
  },
  imageVeil: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "34%",
    opacity: 0.88,
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
    maxWidth: 360,
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
