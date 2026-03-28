import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { MonoButton } from "../../src/components/MonoButton";
import { Panel } from "../../src/components/Panel";
import { ScreenShell } from "../../src/components/ScreenShell";
import { SectionHeading } from "../../src/components/SectionHeading";
import { publicContentRequest } from "../../src/lib/api";
import { useResolvedTheme } from "../../src/lib/theme";
import { useAppStore } from "../../src/store/useAppStore";
import { ContentEntry } from "../../src/types";

export default function ContentIndexScreen() {
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const [contentEntries, setContentEntries] = useState<ContentEntry[]>([]);

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

  return (
    <ScreenShell title="Content" subtitle="JOURNAL / LOOKBOOK / CAMPAIGN" profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel>
          <SectionHeading title="Content hub" subtitle="Multilingual journal, lookbooks, campaigns and collection stories." compact />
        </Panel>
        <View style={styles.grid}>
          {contentEntries.map((entry) => (
            <Panel key={entry.id} style={styles.card}>
              <Image source={{ uri: entry.coverUrl }} style={styles.image} resizeMode="cover" />
              <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>{entry.eyebrow}</Text>
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{entry.title}</Text>
              <Text style={[styles.summary, { color: theme.colors.textSecondary }]}>{entry.summary}</Text>
              <MonoButton label="Open" variant="secondary" onPress={() => router.push(`/content/${entry.slug}?locale=${entry.locale}`)} />
            </Panel>
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18, paddingBottom: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  card: { flexBasis: 320, flexGrow: 1, gap: 12 },
  image: { width: "100%", height: 240, borderRadius: 18 },
  eyebrow: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1.4 },
  title: { fontFamily: "Oswald_500Medium", fontSize: 30, lineHeight: 32, letterSpacing: 0.8 },
  summary: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 14, lineHeight: 22 },
});
