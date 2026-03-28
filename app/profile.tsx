import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { LanguageSwitch } from "../src/components/LanguageSwitch";
import { MonoButton } from "../src/components/MonoButton";
import { MonoInput } from "../src/components/MonoInput";
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
    shellTitle: string;
    shellSubtitle: string;
    liveAccount: string;
    noPhone: string;
    loyalty: string;
    themeTitle: string;
    themeSubtitle: string;
    languageTitle: string;
    languageSubtitle: string;
    accountTitle: string;
    accountSubtitle: string;
    role: string;
    tryOns: string;
    editTitle: string;
    editSubtitle: string;
    name: string;
    phone: string;
    address: string;
    cardBrand: string;
    cardHolder: string;
    cardLast4: string;
    save: string;
    saving: string;
    historyTitle: string;
    historySubtitle: string;
    historyEmpty: string;
    source: string;
    result: string;
    trackerTitle: string;
    trackerSubtitle: string;
    signOut: string;
    linkedCard: string;
    noCard: string;
  }
> = {
  ru: {
    shellTitle: "ПРОФИЛЬ",
    shellSubtitle: "АККАУНТ / НАСТРОЙКИ / ИСТОРИЯ",
    liveAccount: "LIVE ACCOUNT / SESSION",
    noPhone: "ТЕЛЕФОН НЕ ДОБАВЛЕН",
    loyalty: "ЛОЯЛЬНОСТЬ",
    themeTitle: "ТЕМА",
    themeSubtitle: "Ручное переключение light и dark режима доступно на всем продукте.",
    languageTitle: "ЯЗЫК",
    languageSubtitle: "Русский, казахский и английский переключаются как постоянная пользовательская настройка.",
    accountTitle: "СОСТОЯНИЕ АККАУНТА",
    accountSubtitle: "Реальная авторизация, роль пользователя и рабочий слой профиля.",
    role: "РОЛЬ",
    tryOns: "TRY-ON СЕССИИ",
    editTitle: "РЕДАКТИРОВАНИЕ ПРОФИЛЯ",
    editSubtitle: "Контакты, адрес по умолчанию и данные привязанной карты для checkout-потока.",
    name: "ИМЯ",
    phone: "ТЕЛЕФОН",
    address: "АДРЕС ПО УМОЛЧАНИЮ",
    cardBrand: "БРЕНД КАРТЫ",
    cardHolder: "ДЕРЖАТЕЛЬ КАРТЫ",
    cardLast4: "ПОСЛЕДНИЕ 4 ЦИФРЫ",
    save: "СОХРАНИТЬ ПРОФИЛЬ",
    saving: "СОХРАНЕНИЕ...",
    historyTitle: "ИСТОРИЯ AI TRY-ON",
    historySubtitle: "Сохраненные fit-preview и generated results, связанные с клиентским профилем.",
    historyEmpty: "История примерок пока пуста. Создай первый preview из карточки товара.",
    source: "ИСХОДНИК",
    result: "РЕЗУЛЬТАТ",
    trackerTitle: "ТРЕКЕР ЗАКАЗА",
    trackerSubtitle: "Статус клиента обновляется после действий франчайзи и производства в реальном времени.",
    signOut: "ВЫЙТИ",
    linkedCard: "ПРИВЯЗАННАЯ КАРТА",
    noCard: "КАРТА НЕ УКАЗАНА",
  },
  kk: {
    shellTitle: "ПРОФИЛЬ",
    shellSubtitle: "АККАУНТ / БАПТАУЛАР / ТАРИХ",
    liveAccount: "LIVE ACCOUNT / SESSION",
    noPhone: "ТЕЛЕФОН ҚОСЫЛМАҒАН",
    loyalty: "ЛОЯЛДЫҚ",
    themeTitle: "ТЕМА",
    themeSubtitle: "Light және dark режимдерін қолмен ауыстыру бүкіл өнімде қолжетімді.",
    languageTitle: "ТІЛ",
    languageSubtitle: "Орыс, қазақ және ағылшын тілдері тұрақты пайдаланушы параметрі ретінде сақталады.",
    accountTitle: "АККАУНТ КҮЙІ",
    accountSubtitle: "Нақты авторизация, пайдаланушы рөлі және профильдің жұмыс қабаты.",
    role: "РӨЛ",
    tryOns: "TRY-ON СЕССИЯЛАРЫ",
    editTitle: "ПРОФИЛЬДІ ӨҢДЕУ",
    editSubtitle: "Checkout ағыны үшін байланыс, әдепкі мекенжай және карта деректері.",
    name: "АТЫ",
    phone: "ТЕЛЕФОН",
    address: "ӘДЕПКІ МЕКЕНЖАЙ",
    cardBrand: "КАРТА БРЕНДІ",
    cardHolder: "КАРТА ИЕСІ",
    cardLast4: "СОҢҒЫ 4 САН",
    save: "ПРОФИЛЬДІ САҚТАУ",
    saving: "САҚТАЛУДА...",
    historyTitle: "AI TRY-ON ТАРИХЫ",
    historySubtitle: "Клиент профиліне байланған сақталған preview және generated results.",
    historyEmpty: "Try-on тарихы әзірге бос. Алғашқы preview-ды өнім бетінен жаса.",
    source: "БАСТАПҚЫ",
    result: "НӘТИЖЕ",
    trackerTitle: "ТАПСЫРЫС ТРЕКЕРІ",
    trackerSubtitle: "Клиент статусы франчайзи мен өндіріс әрекеттерінен кейін нақты уақытта жаңарады.",
    signOut: "ШЫҒУ",
    linkedCard: "БАЙЛАНҒАН КАРТА",
    noCard: "КАРТА КӨРСЕТІЛМЕГЕН",
  },
  en: {
    shellTitle: "PROFILE",
    shellSubtitle: "ACCOUNT / SETTINGS / HISTORY",
    liveAccount: "LIVE ACCOUNT / SESSION",
    noPhone: "NO PHONE ADDED",
    loyalty: "LOYALTY",
    themeTitle: "THEME",
    themeSubtitle: "Manual light and dark switching stays available across the entire product.",
    languageTitle: "LANGUAGE",
    languageSubtitle: "Russian, Kazakh and English persist as a profile-level user preference.",
    accountTitle: "ACCOUNT STATE",
    accountSubtitle: "Real auth, user role and the live profile layer.",
    role: "ROLE",
    tryOns: "TRY-ON SESSIONS",
    editTitle: "PROFILE EDITING",
    editSubtitle: "Contact details, default shipping address and linked card data for the checkout flow.",
    name: "NAME",
    phone: "PHONE",
    address: "DEFAULT ADDRESS",
    cardBrand: "CARD BRAND",
    cardHolder: "CARD HOLDER",
    cardLast4: "LAST 4 DIGITS",
    save: "SAVE PROFILE",
    saving: "SAVING...",
    historyTitle: "AI TRY-ON HISTORY",
    historySubtitle: "Saved fit previews and generated results tied to the client profile.",
    historyEmpty: "No try-on history yet. Create your first preview from a product page.",
    source: "SOURCE",
    result: "RESULT",
    trackerTitle: "ORDER TRACKER",
    trackerSubtitle: "Client status updates in real time after franchisee and production actions.",
    signOut: "SIGN OUT",
    linkedCard: "LINKED CARD",
    noCard: "NO CARD SET",
  },
};

export default function ProfileScreen() {
  const theme = useResolvedTheme();
  const { width } = useWindowDimensions();
  const user = useAppStore((state) => state.user);
  const activeOrder = useAppStore((state) => state.activeOrder);
  const tryOnSessions = useAppStore((state) => state.tryOnSessions);
  const logout = useAppStore((state) => state.logout);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const language = useAppStore((state) => state.language);
  const copy = COPY[language];
  const isCompact = width < 760;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [defaultShippingAddress, setDefaultShippingAddress] = useState("");
  const [paymentCardBrand, setPaymentCardBrand] = useState("");
  const [paymentCardHolder, setPaymentCardHolder] = useState("");
  const [paymentCardLast4, setPaymentCardLast4] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name);
    setPhone(user.phone ?? "");
    setDefaultShippingAddress(user.defaultShippingAddress ?? "");
    setPaymentCardBrand(user.paymentCardBrand ?? "");
    setPaymentCardHolder(user.paymentCardHolder ?? "");
    setPaymentCardLast4(user.paymentCardLast4 ?? "");
  }, [user]);

  if (!user) {
    router.replace("/login");
    return null;
  }

  const linkedCard = user.paymentCardBrand && user.paymentCardLast4
    ? `${user.paymentCardBrand.toUpperCase()} •••• ${user.paymentCardLast4}`
    : copy.noCard;

  return (
    <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.identity}>
          <View style={[styles.identityGrid, isCompact && styles.identityGridCompact]}>
            <View style={styles.identityCopy}>
              <StatusPill label={`${user.role.toUpperCase()} / ${copy.liveAccount}`} tone="solid" />
              <Text style={[styles.name, isCompact && styles.nameCompact, { color: theme.colors.textPrimary }]}>
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

              <View style={styles.identityMetaGrid}>
                <View style={[styles.identityMeta, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.role}</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>{user.role.toUpperCase()}</Text>
                </View>
                <View style={[styles.identityMeta, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.tryOns}</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>{tryOnSessions.length}</Text>
                </View>
                <View style={[styles.identityMeta, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.linkedCard}</Text>
                  <Text style={[styles.cardValue, { color: theme.colors.textPrimary }]}>{linkedCard}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.identityVisual, isCompact && styles.identityVisualCompact, { borderColor: theme.colors.borderSoft }]}>
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
            <ThemeSwitch compact={isCompact} />
          </Panel>

          <Panel style={styles.settingsPanel}>
            <SectionHeading title={copy.languageTitle} subtitle={copy.languageSubtitle} compact />
            <LanguageSwitch compact={isCompact} />
          </Panel>

          <Panel style={styles.settingsPanel}>
            <SectionHeading title={copy.accountTitle} subtitle={copy.accountSubtitle} compact />
            <View style={styles.metaBlock}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.role}</Text>
              <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>{user.role.toUpperCase()}</Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.tryOns}</Text>
              <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>{tryOnSessions.length}</Text>
            </View>
          </Panel>
        </View>

        <Panel style={styles.editorPanel}>
          <SectionHeading title={copy.editTitle} subtitle={copy.editSubtitle} compact />
          <View style={styles.editorGrid}>
            <MonoInput label={copy.name} value={name} onChangeText={setName} placeholder={copy.name} />
            <MonoInput label={copy.phone} value={phone} onChangeText={setPhone} placeholder="+7 ..." keyboardType="phone-pad" />
            <MonoInput
              label={copy.address}
              value={defaultShippingAddress}
              onChangeText={setDefaultShippingAddress}
              placeholder={copy.address}
              multiline
            />
            <MonoInput
              label={copy.cardBrand}
              value={paymentCardBrand}
              onChangeText={setPaymentCardBrand}
              placeholder="VISA / MASTERCARD / KASPI"
            />
            <MonoInput
              label={copy.cardHolder}
              value={paymentCardHolder}
              onChangeText={setPaymentCardHolder}
              placeholder={copy.cardHolder}
            />
            <MonoInput
              label={copy.cardLast4}
              value={paymentCardLast4}
              onChangeText={(value) => setPaymentCardLast4(value.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              placeholder="0000"
            />
          </View>

          <MonoButton
            label={isSaving ? copy.saving : copy.save}
            onPress={async () => {
              setIsSaving(true);
              try {
                await updateProfile({
                  name,
                  phone,
                  defaultShippingAddress,
                  paymentCardBrand,
                  paymentCardHolder,
                  paymentCardLast4,
                });
              } finally {
                setIsSaving(false);
              }
            }}
          />
        </Panel>

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
                    <View style={styles.tryOnVisualRow}>
                      <View style={[styles.tryOnVisual, isCompact && styles.tryOnVisualCompact]}>
                        <Image source={{ uri: session.sourceImageUrl }} style={[styles.tryOnImage, isCompact && styles.tryOnImageCompact]} resizeMode="cover" />
                        <Text style={[styles.tryOnMeta, { color: theme.colors.textMuted }]}>{copy.source}</Text>
                      </View>
                      <View style={[styles.tryOnVisual, isCompact && styles.tryOnVisualCompact]}>
                        <Image
                          source={{ uri: session.resultImageUrl ?? session.sourceImageUrl }}
                          style={[styles.tryOnImage, isCompact && styles.tryOnImageCompact]}
                          resizeMode="cover"
                        />
                        <Text style={[styles.tryOnMeta, { color: theme.colors.textMuted }]}>{copy.result}</Text>
                      </View>
                    </View>
                    <View style={styles.tryOnCopy}>
                      <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                        {session.status.toUpperCase()}
                      </Text>
                      <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>
                        {new Date(session.createdAt).toLocaleDateString(language)}
                      </Text>
                      <Text style={[styles.tryOnText, { color: theme.colors.textSecondary }]}>
                        {session.notes}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.tryOnText, { color: theme.colors.textSecondary }]}>{copy.historyEmpty}</Text>
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
  identityGridCompact: {
    gap: 14,
  },
  identityCopy: {
    flex: 1,
    minWidth: 300,
    gap: 16,
  },
  name: {
    fontFamily: "Oswald_500Medium",
    fontSize: 46,
    letterSpacing: 1.8,
  },
  nameCompact: {
    fontSize: 32,
    letterSpacing: 1.1,
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
  identityMetaGrid: {
    gap: 10,
  },
  identityMeta: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 6,
  },
  identityVisual: {
    flex: 0.9,
    minWidth: 280,
    minHeight: 420,
    borderWidth: 1,
    borderRadius: 26,
    overflow: "hidden",
  },
  identityVisualCompact: {
    minWidth: "100%",
    minHeight: 260,
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
  cardValue: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 14,
    letterSpacing: 1.1,
  },
  editorPanel: {
    gap: 16,
  },
  editorGrid: {
    gap: 12,
  },
  tryOnGrid: {
    gap: 12,
  },
  tryOnCard: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  tryOnVisualRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tryOnVisual: {
    flex: 1,
    minWidth: 220,
    minHeight: 240,
  },
  tryOnVisualCompact: {
    minWidth: "100%",
    minHeight: 160,
  },
  tryOnImage: {
    width: "100%",
    height: 240,
  },
  tryOnImageCompact: {
    height: 160,
  },
  tryOnMeta: {
    position: "absolute",
    left: 14,
    bottom: 12,
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
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
