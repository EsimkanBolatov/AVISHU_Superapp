import { router } from "expo-router";
import { useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChoiceChip } from "../src/components/ChoiceChip";
import { LanguageSwitch } from "../src/components/LanguageSwitch";
import { MonoButton } from "../src/components/MonoButton";
import { MonoInput } from "../src/components/MonoInput";
import { Panel } from "../src/components/Panel";
import { StatusPill } from "../src/components/StatusPill";
import { ThemeSwitch } from "../src/components/ThemeSwitch";
import { loginHeroArt } from "../src/lib/brandArt";
import { useResolvedTheme } from "../src/lib/theme";
import { useAppStore } from "../src/store/useAppStore";
import { AppLanguage } from "../src/types";

const ACCESS_PRESETS = [
  {
    label: "CLIENT",
    email: "client@avishu.kz",
    password: "Client123!",
  },
  {
    label: "ADMIN",
    email: "admin@avishu.kz",
    password: "Admin123!",
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
  {
    label: "SUPPORT",
    email: "support@avishu.kz",
    password: "Support123!",
  },
];

const COPY: Record<
  AppLanguage,
  {
    back: string;
    badge: string;
    title: string;
    copy: string;
    signIn: string;
    register: string;
    name: string;
    email: string;
    password: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    processing: string;
    enter: string;
    createAccount: string;
    qa: string;
    authError: string;
    visualMeta: string;
    visualTitle: string;
    checklist: string[];
  }
> = {
  ru: {
    back: "НАЗАД К ЛЕНДИНГУ",
    badge: "REAL AUTH / SESSION FLOW",
    title: "ВХОД ЧЕРЕЗ РЕАЛЬНУЮ УЧЕТНУЮ ЗАПИСЬ, А НЕ DEMO ROLE SWITCHING",
    copy: "Система уже использует email, пароль и настоящую сессию. Регистрация создает клиентский аккаунт, а business-профили помогают проверять процессы франчайзи и производства.",
    signIn: "ВОЙТИ",
    register: "РЕГИСТРАЦИЯ",
    name: "ИМЯ",
    email: "EMAIL",
    password: "ПАРОЛЬ",
    namePlaceholder: "Ваше полное имя",
    emailPlaceholder: "client@avishu.kz",
    passwordPlaceholder: "Минимум 8 символов",
    processing: "ОБРАБОТКА...",
    enter: "ВОЙТИ В СИСТЕМУ",
    createAccount: "СОЗДАТЬ АККАУНТ",
    qa: "ТЕСТОВЫЙ ДОСТУП",
    authError: "Не удалось выполнить вход.",
    visualMeta: "PRODUCT PLATFORM / CREDENTIAL ACCESS / OPERATIONAL DEPTH",
    visualTitle: "АККАУНТ, КАТАЛОГ, TRY-ON И БИЗНЕС-ОПЕРАЦИИ В ЕДИНОМ ПРОДУКТОВОМ СЛОЕ",
    checklist: [
      "Клиентская регистрация и сохраненная авторизация.",
      "Каталог франчайзи, управление товарами и заказами.",
      "Производственный поток со статусами, комментариями и файлами.",
    ],
  },
  kk: {
    back: "ЛЕНДИНГКЕ ҚАЙТУ",
    badge: "REAL AUTH / SESSION FLOW",
    title: "DEMO ROLE SWITCH ЕМЕС, НАҚТЫ АККАУНТ АРҚЫЛЫ КІРУ",
    copy: "Жүйе енді email, пароль және нақты сессиямен жұмыс істейді. Тіркелу клиенттік аккаунт жасайды, ал бизнес-профильдер франчайзи мен өндіріс ағындарын тексеруге мүмкіндік береді.",
    signIn: "КІРУ",
    register: "ТІРКЕЛУ",
    name: "АТЫ",
    email: "EMAIL",
    password: "ҚҰПИЯСӨЗ",
    namePlaceholder: "Толық атыңыз",
    emailPlaceholder: "client@avishu.kz",
    passwordPlaceholder: "Кемінде 8 таңба",
    processing: "ӨҢДЕЛУДЕ...",
    enter: "ЖҮЙЕГЕ КІРУ",
    createAccount: "АККАУНТ ҚҰРУ",
    qa: "ТЕСТ ҚОЛЖЕТІМІ",
    authError: "Кіру орындалмады.",
    visualMeta: "PRODUCT PLATFORM / CREDENTIAL ACCESS / OPERATIONAL DEPTH",
    visualTitle: "АККАУНТ, КАТАЛОГ, TRY-ON ЖӘНЕ БИЗНЕС ОПЕРАЦИЯЛАРЫ БІР ПЛАТФОРМАДА",
    checklist: [
      "Клиенттік тіркелу және сақталатын авторизация.",
      "Франчайзи каталогы, тауарлар мен тапсырыстарды басқару.",
      "Статус, пікір және файлдары бар өндірістік ағын.",
    ],
  },
  en: {
    back: "BACK TO LANDING",
    badge: "REAL AUTH / SESSION FLOW",
    title: "SIGN IN THROUGH REAL ACCOUNT ACCESS, NOT DEMO ROLE SWITCHING",
    copy: "The system now runs on email, password and a real session layer. Registration creates a client account, while business profiles validate franchisee and production operations.",
    signIn: "SIGN IN",
    register: "REGISTER",
    name: "NAME",
    email: "EMAIL",
    password: "PASSWORD",
    namePlaceholder: "Your full name",
    emailPlaceholder: "client@avishu.kz",
    passwordPlaceholder: "Minimum 8 characters",
    processing: "PROCESSING...",
    enter: "ENTER SYSTEM",
    createAccount: "CREATE ACCOUNT",
    qa: "SEEDED ACCESS",
    authError: "Authentication failed.",
    visualMeta: "PRODUCT PLATFORM / CREDENTIAL ACCESS / OPERATIONAL DEPTH",
    visualTitle: "ACCOUNT LAYER, CATALOG SYSTEM, TRY-ON PIPELINE AND BUSINESS OPERATIONS",
    checklist: [
      "Client registration and persistent auth session.",
      "Franchisee catalog, product editing and order control.",
      "Production flow with stage changes, comments and files.",
    ],
  },
};

export default function LoginScreen() {
  const theme = useResolvedTheme();
  const { width } = useWindowDimensions();
  const language = useAppStore((state) => state.language);
  const login = useAppStore((state) => state.login);
  const register = useAppStore((state) => state.register);
  const isLoading = useAppStore((state) => state.isLoading);
  const user = useAppStore((state) => state.user);
  const copy = COPY[language];
  const isCompact = width < 760;

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
        : currentUser.role === "admin"
          ? "/admin"
          : currentUser.role === "franchisee"
            ? "/franchisee"
            : currentUser.role === "support"
              ? "/support"
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
      setError(submitError instanceof Error ? submitError.message : copy.authError);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={[styles.container, isCompact && styles.containerCompact]} showsVerticalScrollIndicator={false}>
        <View style={[styles.topbar, isCompact && styles.topbarCompact]}>
          <MonoButton label={copy.back} variant="secondary" onPress={() => router.replace("/")} />
          <View style={[styles.topbarRight, isCompact && styles.topbarRightCompact]}>
            <LanguageSwitch compact={isCompact} />
            <ThemeSwitch compact={isCompact} />
          </View>
        </View>

        <View style={[styles.grid, isCompact && styles.gridCompact]}>
          <Panel style={[styles.leftPanel, isCompact && styles.leftPanelCompact]}>
            <StatusPill label={copy.badge} tone="solid" />
            <Text style={[styles.brand, isCompact && styles.brandCompact, { color: theme.colors.textPrimary }]}>AVISHU</Text>
            <Text style={[styles.title, isCompact && styles.titleCompact, { color: theme.colors.textPrimary }]}>{copy.title}</Text>
            <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>{copy.copy}</Text>

            <View style={styles.modeRow}>
              <ChoiceChip label={copy.signIn} active={mode === "login"} onPress={() => setMode("login")} />
              <ChoiceChip label={copy.register} active={mode === "register"} onPress={() => setMode("register")} />
            </View>

            <View style={styles.form}>
              {mode === "register" ? (
                <MonoInput
                  label={copy.name}
                  value={name}
                  onChangeText={setName}
                  placeholder={copy.namePlaceholder}
                />
              ) : null}
              <MonoInput
                label={copy.email}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder={copy.emailPlaceholder}
              />
              <MonoInput
                label={copy.password}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder={copy.passwordPlaceholder}
              />
            </View>

            {error ? <Text style={[styles.error, { color: "#B3261E" }]}>{error}</Text> : null}

            <MonoButton
              label={isLoading ? copy.processing : mode === "login" ? copy.enter : copy.createAccount}
              onPress={handleSubmit}
            />

            <View style={styles.presetBlock}>
              <Text style={[styles.presetLabel, { color: theme.colors.textMuted }]}>{copy.qa}</Text>
              <View style={styles.presetList}>
                {ACCESS_PRESETS.map((preset) => (
                  <Panel key={preset.label} style={styles.presetCard}>
                    <View style={styles.presetHead}>
                      <Text style={[styles.presetTitle, { color: theme.colors.textPrimary }]}>
                        {preset.label}
                      </Text>
                      <MonoButton
                        label={copy.signIn}
                        variant="secondary"
                        onPress={() => {
                          setMode("login");
                          setEmail(preset.email);
                          setPassword(preset.password);
                        }}
                      />
                    </View>
                    <Text style={[styles.presetText, { color: theme.colors.textSecondary }]}>
                      {preset.email}
                    </Text>
                    <Text style={[styles.presetHint, { color: theme.colors.textMuted }]}>
                      {preset.password}
                    </Text>
                  </Panel>
                ))}
              </View>
            </View>
          </Panel>

          <Panel style={[styles.rightPanel, isCompact && styles.rightPanelCompact]}>
            <View style={[styles.visualGlow, { backgroundColor: theme.colors.glow }]} />
            <Text style={[styles.visualMeta, { color: theme.colors.textMuted }]}>{copy.visualMeta}</Text>
            <Text style={[styles.visualTitle, isCompact && styles.visualTitleCompact, { color: theme.colors.textPrimary }]}>
              {copy.visualTitle}
            </Text>

            <View style={[styles.visualFrame, isCompact && styles.visualFrameCompact, { borderColor: theme.colors.borderSoft }]}>
              <View style={[styles.visualInner, { backgroundColor: theme.colors.surfaceSecondary }]}>
                {/* Исправил логику картинки, чтобы она адекватно вписывалась в мобилку */}
                <Image source={loginHeroArt} style={[styles.imageFill, isCompact && styles.imageFillCompact]} resizeMode={isCompact ? "contain" : "cover"} />
                {!isCompact && (
                  <View
                    style={[
                      styles.visualVeil,
                      {
                        backgroundColor: theme.colors.background,
                      },
                    ]}
                  />
                )}
              </View>
            </View>

            <View style={styles.visualChecklist}>
              {copy.checklist.map((item) => (
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
  containerCompact: {
    paddingHorizontal: 16,
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  topbarCompact: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 16,
  },
  topbarRight: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  topbarRightCompact: {
    justifyContent: "flex-start",
  },
  grid: {
    flexDirection: "row",
    gap: 18,
    alignItems: "stretch",
  },
  gridCompact: {
    flexDirection: "column",
    gap: 14,
  },
  leftPanel: {
    flex: 1,
    minWidth: 340,
    gap: 18,
  },
  leftPanelCompact: {
    minWidth: "100%",
    flex: 0,
  },
  rightPanel: {
    flex: 1,
    minWidth: 320,
    minHeight: 980,
    gap: 18,
    overflow: "hidden",
  },
  rightPanelCompact: {
    minWidth: "100%",
    minHeight: 0,
    flex: 0,
    gap: 14,
  },
  brand: {
    fontFamily: "Oswald_500Medium",
    fontSize: 76,
    letterSpacing: 3.6,
  },
  brandCompact: {
    fontSize: 42,
    letterSpacing: 2,
  },
  title: {
    maxWidth: 720,
    fontFamily: "Oswald_500Medium",
    fontSize: 46,
    lineHeight: 50,
    letterSpacing: 1.1,
  },
  titleCompact: {
    fontSize: 30,
    lineHeight: 34,
  },
  copy: {
    maxWidth: 650,
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
    paddingTop: 8,
  },
  presetLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
  presetList: {
    gap: 10,
  },
  presetCard: {
    gap: 8,
  },
  presetHead: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  presetTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    letterSpacing: 0.9,
  },
  presetText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    lineHeight: 20,
  },
  presetHint: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  visualGlow: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 360,
    height: 360,
    borderRadius: 999,
    opacity: 0.84,
  },
  visualMeta: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.7,
  },
  visualTitle: {
    maxWidth: 520,
    fontFamily: "Oswald_500Medium",
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: 0.9,
  },
  visualTitleCompact: {
    fontSize: 26,
    lineHeight: 30,
  },
  visualFrame: {
    flex: 1,
    minHeight: 560,
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
  },
  visualFrameCompact: {
    minHeight: 240,
    height: 240, // Фиксируем высоту для мобилки
    flex: 0,
  },
  visualInner: {
    flex: 1,
    overflow: "hidden",
    justifyContent: 'center', // Центрируем картинку
    alignItems: 'center',
  },
  imageFill: {
    position: "absolute",
    right: -340,
    bottom: -58,
    width: 1180,
    height: 1080,
    transform: [{ scale: 1.05 }],
  },
  imageFillCompact: {
    position: 'relative', // Убираем абсолютное позиционирование на мобилке
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    transform: [{ scale: 1 }],
  },
  visualVeil: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "24%",
    opacity: 0.8,
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