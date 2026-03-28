import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text } from "react-native";

import { MonoButton } from "../../src/components/MonoButton";
import { Panel } from "../../src/components/Panel";
import { ScreenShell } from "../../src/components/ScreenShell";
import { publicContentRequest } from "../../src/lib/api";
import { useResolvedTheme } from "../../src/lib/theme";
import { useAppStore } from "../../src/store/useAppStore";
import { ContentEntry } from "../../src/types";

export default function ContentDetailScreen() {
  const theme = useResolvedTheme();
  const router = useRouter();
  const { slug, locale } = useLocalSearchParams<{ slug: string; locale?: string }>();
  const language = useAppStore((state) => state.language);
  const [entry, setEntry] = useState<ContentEntry | null>(null);

  useEffect(() => {
    let active = true;

    void publicContentRequest(locale ?? language).then((response) => {
      const found = response.contentEntries.find((item) => item.slug === slug) ?? null;

      if (active) {
        setEntry(found);
      }
    });

    return () => {
      active = false;
    };
  }, [language, locale, slug]);

  if (!entry) {
    return null;
  }

  return (
    <ScreenShell title={entry.kind.toUpperCase()} subtitle={entry.title} profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.hero}>
          <Image source={{ uri: entry.coverUrl }} style={styles.image} resizeMode="cover" />
          <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>{entry.eyebrow}</Text>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{entry.title}</Text>
          <Text style={[styles.summary, { color: theme.colors.textSecondary }]}>{entry.summary}</Text>
        </Panel>
        <Panel>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{entry.body}</Text>
        </Panel>
        <MonoButton label="Back to content" variant="secondary" onPress={() => router.replace("/content")} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18, paddingBottom: 24 },
  hero: { gap: 12 },
  image: { width: "100%", height: 420, borderRadius: 22 },
  eyebrow: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 10, letterSpacing: 1.5 },
  title: { fontFamily: "Oswald_500Medium", fontSize: 42, lineHeight: 46, letterSpacing: 0.8 },
  summary: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 16, lineHeight: 24 },
  body: { fontFamily: "SpaceGrotesk_400Regular", fontSize: 15, lineHeight: 24 },
});
