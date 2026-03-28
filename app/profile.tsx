import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { LanguageSwitch } from "../src/components/LanguageSwitch";
import { MonoButton } from "../src/components/MonoButton";
import { OrderTracker } from "../src/components/OrderTracker";
import { Panel } from "../src/components/Panel";
import { ScreenShell } from "../src/components/ScreenShell";
import { SectionHeading } from "../src/components/SectionHeading";
import { StatusPill } from "../src/components/StatusPill";
import { ThemeSwitch } from "../src/components/ThemeSwitch";
import { referenceTechJacket } from "../src/lib/brandArt";
import { useResolvedTheme } from "../src/lib/theme";
import { useAppStore } from "../src/store/useAppStore";
import { AppLanguage } from "../src/types";

const COPY: Record<
  AppLanguage,
  {
    subtitle: string;
    themeTitle: string;
    themeSubtitle: string;
    languageTitle: string;
    languageSubtitle: string;
    accountTitle: string;
    accountSubtitle: string;
    roleLabel: string;
    tryOnLabel: string;
    historyTitle: string;
    historySubtitle: string;
    emptyHistory: string;
    trackerTitle: string;
    trackerSubtitle: string;
    signOut: string;
    loyalty: string;
    noPhone: string;
  }
> = {
  ru: {
    subtitle: "АККАУНТ / НАСТРОЙКИ / ИСТОРИЯ",
    themeTitle: "ТЕМА",
    themeSubtitle: "Ручное переключение светлого и темного режима должно оставаться доступным глобально.",
    languageTitle: "ЯЗЫК",
    languageSubtitle: "Русский, казахский и английский должны быть доступны как полноценная настройка профиля.",
    accountTitle: "СОСТОЯНИЕ АККАУНТА",
    accountSubtitle: "Реальная сессия, email пользователя и роль в продуктовой системе.",
    roleLabel: "РОЛЬ",
    tryOnLabel: "TRY-ON СЕССИИ",
    historyTitle: "ИСТОРИЯ AI TRY-ON",
    historySubtitle: "Сохраненные примерки и сгенерированные результаты, привязанные к профилю клиента.",
    emptyHistory: "История примерок пока пуста. Создай первую fit-preview с карточки товара.",
    trackerTitle: "ТРЕКЕР ЗАКАЗА",
    trackerSubtitle: "Прогресс клиента обновляется после действий франчайзи и цеха в реальном времени.",
    signOut: "ВЫЙТИ",
    loyalty: "ЛОЯЛЬНОСТЬ",
    noPhone: "ТЕЛЕФОН НЕ ДОБАВЛЕН",
  },
  kk: {
    subtitle: "АККАУНТ / БАПТАУЛАР / ТАРИХ",
    themeTitle: "ТЕМА",
    themeSubtitle: "Жарық және қараңғы режимді қолмен ауыстыру бүкіл жүйеде қолжетімді болуы керек.",
    languageTitle: "ТІЛ",
    languageSubtitle: "Қазақ, орыс және ағылшын тілдері профильдегі толыққанды баптау ретінде болуы тиіс.",
    accountTitle: "АККАУНТ КҮЙІ",
    accountSubtitle: "Нақты сессия, пайдаланушы email-ы және өнім ішіндегі рөл.",
    roleLabel: "РӨЛ",
    tryOnLabel: "TRY-ON СЕССИЯЛАРЫ",
    historyTitle: "AI TRY-ON ТАРИХЫ",
    historySubtitle: "Клиент профиліне байланысқан сақталған preview және generated results.",
    emptyHistory: "Try-on тарихы әзірге бос. Алғашқы fit-preview-ді өнім бетінен жаса.",
    trackerTitle: "ТАПСЫРЫС ТРЕКЕРІ",
    trackerSubtitle: "Клиент прогресі франчайзи мен өндіріс әрекеттерінен кейін нақты уақытта жаңарады.",
    signOut: "ШЫҒУ",
    loyalty: "ЛОЯЛДЫҚ",
    noPhone: "ТЕЛЕФОН ҚОСЫЛМАҒАН",
  },
  en: {
    subtitle: "ACCOUNT / PREFERENCES / HISTORY",
    themeTitle: "THEME",
    themeSubtitle: "Manual light and dark switching should remain globally available.",
    languageTitle: "LANGUAGE",
    languageSubtitle: "Russian, Kazakh and English should be available as a real profile-level preference.",
    accountTitle: "ACCOUNT STATE",
    accountSubtitle: "Real auth session, stored email and role inside the product system.",
    roleLabel: "ROLE",
    tryOnLabel: "TRY-ON SESSIONS",
    historyTitle: "AI TRY-ON HISTORY",
    historySubtitle: "Saved previews and generated results tied to the client profile.",
    emptyHistory: "No try-on history yet. Generate your first fit preview from a product page.",
    trackerTitle: "ORDER TRACKER",
    trackerSubtitle: "Client progress updates from franchisee and atelier actions in real time.",
    signOut: "SIGN OUT",
    loyalty: "LOYALTY",
    noPhone: "NO PHONE",
  },
};

export default function ProfileScreen() {
  const theme = useResolvedTheme();
  const user = useAppStore((state) => state.user);
  const activeOrder = useAppStore((state) => state.activeOrder);
  const tryOnSessions = useAppStore((state) => state.tryOnSessions);
  const logout = useAppStore((state) => state.logout);
  const language = useAppStore((state) => state.language);
  const copy = COPY[language];

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <ScreenShell title="PROFILE" subtitle={copy.subtitle}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.identity}>
          <View style={styles.identityGrid}>
            <View style={styles.identityCopy}>
              <StatusPill label={`${user.role.toUpperCase()} ACCOUNT / LIVE SESSION`} tone="solid" />
              <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
                {user.name.toUpperCase()}
              </Text>
              <Text style={[styles.role, { color: theme.colors.textSecondary }]}>
                {user.email} / {user.phone ?? copy.noPhone}
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
                {copy.loyalty} / {user.loyaltyProgress}% TO NEXT TIER
              </Text>
            </View>

            <View style={[styles.identityVisual, { borderColor: theme.colors.borderSoft }]}>
              <View style={[styles.visualGlow, { backgroundColor: theme.colors.glow }]} />
              <Image
                source={user.avatarUrl ? { uri: user.avatarUrl } : referenceTechJacket}
                style={styles.visualImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </Panel>

        <View style={styles.grid}>
          <Panel style={styles.settingsPanel}>
            <SectionHeading title={copy.themeTitle} subtitle={copy.themeSubtitle} compact />
            <ThemeSwitch />
          </Panel>

          <Panel style={styles.settingsPanel}>
            <SectionHeading title={copy.languageTitle} subtitle={copy.languageSubtitle} compact />
            <LanguageSwitch />
          </Panel>

          <Panel style={styles.settingsPanel}>
            <SectionHeading title={copy.accountTitle} subtitle={copy.accountSubtitle} compact />
            <View style={styles.metaBlock}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.roleLabel}</Text>
              <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>
                {user.role.toUpperCase()}
              </Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.tryOnLabel}</Text>
              <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>
                {tryOnSessions.length}
              </Text>
            </View>
          </Panel>
        </View>

        {user.role === "client" ? (
          <Panel>
            <SectionHeading title={copy.historyTitle} subtitle={copy.historySubtitle} compact />
            <View style={styles.tryOnGrid}>
              {tryOnSessions.length ? (
                tryOnSessions.map((session) => (
                  <View
                    key={session.id}
                    style={[
                      styles.tryOnCard,
                      {
                        borderColor: theme.colors.borderSoft,
                        backgroundColor: theme.colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: session.resultImageUrl ?? session.sourceImageUrl }}
                      style={styles.tryOnImage}
                      resizeMode="cover"
                    />
                    <View style={styles.tryOnCopy}>
                      <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                        {session.status.toUpperCase()}
                      </Text>
                      <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>
                        {new Date(session.createdAt).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.tryOnText, { color: theme.colors.textSecondary }]}>
                        {session.notes}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.tryOnText, { color: theme.colors.textSecondary }]}>
                  {copy.emptyHistory}
                </Text>
              )}
            </View>
          </Panel>
        ) : null}

        {activeOrder ? (
          <Panel>
            <SectionHeading title={copy.trackerTitle} subtitle={copy.trackerSubtitle} compact />
            <OrderTracker order={activeOrder} />
          </Panel>
        ) : null}

        <MonoButton
          label={copy.signOut}
          variant="secondary"
          onPress={async () => {
            await logout();
            router.replace("/login");
          }}
        />
      </ScrollView>
    </ScreenShell>
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
    width: "100%",
    height: "100%",
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
  metaBlock: {
    gap: 4,
  },
  metaLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  metaValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    letterSpacing: 0.8,
  },
  tryOnGrid: {
    gap: 12,
  },
  tryOnCard: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  tryOnImage: {
    width: "100%",
    height: 220,
  },
  tryOnCopy: {
    padding: 16,
    gap: 8,
  },
  tryOnText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
});
