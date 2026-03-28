import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguageSwitch } from "../src/components/LanguageSwitch";
import { MonoButton } from "../src/components/MonoButton";
import { Panel } from "../src/components/Panel";
import { SectionHeading } from "../src/components/SectionHeading";
import { StatusPill } from "../src/components/StatusPill";
import { ThemeSwitch } from "../src/components/ThemeSwitch";
import { publicContentRequest } from "../src/lib/api";
import { landingHeroArt } from "../src/lib/brandArt";
import { useResolvedTheme } from "../src/lib/theme";
import { useAppStore } from "../src/store/useAppStore";
import { AppLanguage, ContentEntry } from "../src/types";

const COPY: Record<
  AppLanguage,
  {
    meta: string;
    badge: string;
    title: string;
    body: string;
    primary: string;
    secondary: string;
    journalTitle: string;
    journalSubtitle: string;
    openJournal: string;
  }
> = {
  ru: {
    meta: "FUTURE OUTERWEAR / COMMERCE SYSTEM",
    badge: "PREMIUM OUTERWEAR / STORY / OPERATIONS",
    title: "PREMIUM OUTERWEAR STORE WITH CONTENT, FIT TECH AND LIVE OPERATIONS",
    body: "AVISHU строится как premium digital boutique: сильный каталог, мультиязычный контент, try-on, loyalty и видимый order flow внутри одного продукта.",
    primary: "Войти",
    secondary: "Открыть журнал",
    journalTitle: "Журнал и кампании",
    journalSubtitle: "Публичный контентный слой для бренда, acquisition и storytelling.",
    openJournal: "Открыть content hub",
  },
  kk: {
    meta: "FUTURE OUTERWEAR / COMMERCE SYSTEM",
    badge: "PREMIUM OUTERWEAR / STORY / OPERATIONS",
    title: "CONTENT, FIT TECH ЖӘНЕ LIVE OPERATIONS БАР PREMIUM OUTERWEAR STORE",
    body: "AVISHU premium digital boutique ретінде құрылады: күшті каталог, көптілді контент, try-on, loyalty және бір өнім ішіндегі көрінетін order flow.",
    primary: "Кіру",
    secondary: "Журналды ашу",
    journalTitle: "Журнал және кампаниялар",
    journalSubtitle: "Бренд, acquisition және storytelling үшін public content layer.",
    openJournal: "Content hub ашу",
  },
  en: {
    meta: "FUTURE OUTERWEAR / COMMERCE SYSTEM",
    badge: "PREMIUM OUTERWEAR / STORY / OPERATIONS",
    title: "PREMIUM OUTERWEAR STORE WITH CONTENT, FIT TECH AND LIVE OPERATIONS",
    body: "AVISHU is structured as a premium digital boutique: a strong catalog, multilingual content, try-on, loyalty and visible order flow inside one product system.",
    primary: "Enter",
    secondary: "Open journal",
    journalTitle: "Journal and campaigns",
    journalSubtitle: "A public content layer for brand, acquisition and storytelling.",
    openJournal: "Open content hub",
  },
};

export default function IndexScreen() {
  const user = useAppStore((state) => state.user);
  const language = useAppStore((state) => state.language);
  const theme = useResolvedTheme();
  const copy = COPY[language];
  const { width } = useWindowDimensions();
  const [contentEntries, setContentEntries] = useState<ContentEntry[]>([]);
  const isCompact = width < 760;

  useEffect(() => {
    let active = true;

    void publicContentRequest(language).then((response) => {
      if (active) {
        setContentEntries(response.contentEntries);
      }
    });

    return () => {
      active = false;
    };
  }, [language]);

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

  if (user?.role === "support") {
    return <Redirect href="/support" />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.topbar, isCompact && styles.topbarCompact]}>
          <View style={styles.topbarLeft}>
            <Text style={[styles.logo, isCompact && styles.logoCompact, { color: theme.colors.textPrimary }]}>AVISHU</Text>
            <Text style={[styles.topbarMeta, { color: theme.colors.textMuted }]}>{copy.meta}</Text>
          </View>
          <View style={styles.topbarRight}>
            <LanguageSwitch compact={isCompact} />
            <ThemeSwitch compact={isCompact} />
            <StatusPill label="LIVE PROTOTYPE / 2026" tone="ghost" />
          </View>
        </View>

        <View style={[styles.hero, isCompact && styles.heroCompact]}>
          <View style={styles.heroLeft}>
            <StatusPill label={copy.badge} tone="solid" />
            <Text style={[styles.heroTitle, isCompact && styles.heroTitleCompact, { color: theme.colors.textPrimary }]}>
              {copy.title}
            </Text>
            <Text style={[styles.heroCopy, { color: theme.colors.textSecondary }]}>{copy.body}</Text>

            <View style={styles.heroActions}>
              <MonoButton label={copy.primary} onPress={() => router.push("/login")} />
              <MonoButton label={copy.secondary} variant="secondary" onPress={() => router.push("/content")} />
            </View>
          </View>

          <Panel style={[styles.heroVisual, isCompact && styles.heroVisualCompact]}>
            <Image source={landingHeroArt} style={[styles.heroImage, isCompact && styles.heroImageCompact]} resizeMode="cover" />
          </Panel>
        </View>

        <Panel style={styles.contentPanel}>
          <View style={styles.contentHead}>
            <SectionHeading title={copy.journalTitle} subtitle={copy.journalSubtitle} compact />
            <MonoButton label={copy.openJournal} variant="secondary" onPress={() => router.push("/content")} />
          </View>
          <View style={styles.contentGrid}>
            {contentEntries.slice(0, 3).map((entry) => (
              <Panel key={entry.id} style={styles.contentCard}>
                <Image source={{ uri: entry.coverUrl }} style={styles.contentImage} resizeMode="cover" />
                <Text style={[styles.contentEyebrow, { color: theme.colors.textMuted }]}>{entry.eyebrow}</Text>
                <Text style={[styles.contentTitle, { color: theme.colors.textPrimary }]}>{entry.title}</Text>
                <Text style={[styles.contentBody, { color: theme.colors.textSecondary }]}>{entry.summary}</Text>
                <MonoButton label="Open" variant="secondary" onPress={() => router.push(`/content/${entry.slug}?locale=${entry.locale}`)} />
              </Panel>
            ))}
          </View>
        </Panel>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 44, gap: 18 },
  topbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  topbarCompact: { alignItems: "flex-start" },
  topbarLeft: { gap: 4 },
  topbarRight: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" },
  logo: { fontFamily: "Oswald_500Medium", fontSize: 28, letterSpacing: 2.4 },
  logoCompact: { fontSize: 24, letterSpacing: 1.8 },
  topbarMeta: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1.6 },
  hero: { flexDirection: "row", flexWrap: "wrap", gap: 18, alignItems: "stretch" },
  heroCompact: { gap: 14 },
  heroLeft: { flex: 1.05, minWidth: 320, gap: 14, justifyContent: "space-between" },
  heroTitle: { maxWidth: 720, fontFamily: "Oswald_500Medium", fontSize: 56, lineHeight: 60, letterSpacing: 0.8 },
  heroTitleCompact: { fontSize: 36, lineHeight: 38 },
  heroCopy: { maxWidth: 620, fontFamily: "SpaceGrotesk_400Regular", fontSize: 15, lineHeight: 25 },
  heroActions: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingTop: 6 },
  heroVisual: { flex: 1, minWidth: 340, minHeight: 680, padding: 0, overflow: "hidden" },
  heroVisualCompact: { minWidth: "100%", minHeight: 320 },
  heroImage: { width: "100%", height: "100%" },
  heroImageCompact: { width: "100%", height: "100%" },
  contentPanel: { gap: 14 },
  contentHead: { flexDirection: "row", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" },
  contentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  contentCard: { flexBasis: 300, flexGrow: 1, gap: 10 },
  contentImage: { width: "100%", height: 220, borderRadius: 18 },
  contentEyebrow: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1.4 },
  contentTitle: { fontFamily: "Oswald_500Medium", fontSize: 28, lineHeight: 30, letterSpacing: 0.8 },
  contentBody: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 14, lineHeight: 22 },
});
