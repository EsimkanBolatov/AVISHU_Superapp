import { Redirect, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
import { AppLanguage, SavedAddressPayload, SavedPaymentCardPayload } from "../src/types";

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    shellSubtitle: string;
    accountState: string;
    accountSubtitle: string;
    loyalty: string;
    points: string;
    tier: string;
    segment: string;
    editTitle: string;
    editSubtitle: string;
    name: string;
    phone: string;
    saveProfile: string;
    addressesTitle: string;
    addressesSubtitle: string;
    cardsTitle: string;
    cardsSubtitle: string;
    label: string;
    city: string;
    line1: string;
    line2: string;
    holder: string;
    brand: string;
    last4: string;
    create: string;
    update: string;
    remove: string;
    rewardsTitle: string;
    rewardsSubtitle: string;
    repeatOrdersTitle: string;
    repeatOrdersSubtitle: string;
    repeatOrder: string;
    tryOnsTitle: string;
    tryOnsSubtitle: string;
    trackerTitle: string;
    trackerSubtitle: string;
    themeTitle: string;
    themeSubtitle: string;
    languageTitle: string;
    languageSubtitle: string;
    signOut: string;
    empty: string;
    source: string;
    result: string;
  }
> = {
  ru: {
    shellTitle: "Профиль",
    shellSubtitle: "ACCOUNT / SETTINGS / SAVED DATA",
    accountState: "Состояние аккаунта",
    accountSubtitle: "Реальная auth-модель, loyalty tier, customer segment и данные для CRM.",
    loyalty: "Лояльность",
    points: "Баллы",
    tier: "Tier",
    segment: "Сегмент",
    editTitle: "Базовые данные",
    editSubtitle: "Имя и телефон клиента как источник checkout и CRM-коммуникации.",
    name: "Имя",
    phone: "Телефон",
    saveProfile: "Сохранить профиль",
    addressesTitle: "Сохраненные адреса",
    addressesSubtitle: "Адреса для checkout, доставки и repeat purchase flow.",
    cardsTitle: "Сохраненные карты",
    cardsSubtitle: "Платежные данные для ускоренного checkout.",
    label: "Label",
    city: "Город",
    line1: "Адрес",
    line2: "Комментарий",
    holder: "Держатель",
    brand: "Бренд",
    last4: "Последние 4 цифры",
    create: "Создать",
    update: "Обновить",
    remove: "Удалить",
    rewardsTitle: "Rewards",
    rewardsSubtitle: "Система loyalty rewards и привилегий по tier.",
    repeatOrdersTitle: "Повтор заказа",
    repeatOrdersSubtitle: "Delivered-заказы можно запускать повторно без ручного ввода checkout.",
    repeatOrder: "Повторить заказ",
    tryOnsTitle: "AI try-on history",
    tryOnsSubtitle: "Сохраненные примерки и результат generation pipeline.",
    trackerTitle: "Order tracker",
    trackerSubtitle: "Live-статус активного заказа по operational chain.",
    themeTitle: "Тема",
    themeSubtitle: "Light / dark переключение сохраняется как пользовательское предпочтение.",
    languageTitle: "Язык",
    languageSubtitle: "ru / kk / en применяются ко всему продукту.",
    signOut: "Выйти",
    empty: "Пока пусто",
    source: "Source",
    result: "Result",
  },
  kk: {
    shellTitle: "Профиль",
    shellSubtitle: "ACCOUNT / SETTINGS / SAVED DATA",
    accountState: "Аккаунт күйі",
    accountSubtitle: "Нақты auth-модель, loyalty tier, customer segment және CRM-ге арналған деректер.",
    loyalty: "Лоялдылық",
    points: "Ұпай",
    tier: "Tier",
    segment: "Сегмент",
    editTitle: "Негізгі деректер",
    editSubtitle: "Клиент аты мен телефоны checkout және CRM-коммуникация үшін қолданылады.",
    name: "Аты",
    phone: "Телефон",
    saveProfile: "Профильді сақтау",
    addressesTitle: "Сақталған мекенжайлар",
    addressesSubtitle: "Checkout, жеткізу және repeat purchase үшін мекенжайлар.",
    cardsTitle: "Сақталған карталар",
    cardsSubtitle: "Жылдам checkout үшін төлем деректері.",
    label: "Label",
    city: "Қала",
    line1: "Мекенжай",
    line2: "Комментарий",
    holder: "Иесі",
    brand: "Бренд",
    last4: "Соңғы 4 сан",
    create: "Құру",
    update: "Жаңарту",
    remove: "Жою",
    rewardsTitle: "Rewards",
    rewardsSubtitle: "Tier бойынша loyalty rewards жүйесі.",
    repeatOrdersTitle: "Repeat order",
    repeatOrdersSubtitle: "Delivered тапсырыстарды қайта checkout енгізбей қайталауға болады.",
    repeatOrder: "Тапсырысты қайталау",
    tryOnsTitle: "AI try-on history",
    tryOnsSubtitle: "Сақталған примерка және generation нәтижелері.",
    trackerTitle: "Order tracker",
    trackerSubtitle: "Operational chain бойынша актив тапсырыс күйі.",
    themeTitle: "Тема",
    themeSubtitle: "Light / dark таңдауы пайдаланушы параметрі ретінде сақталады.",
    languageTitle: "Тіл",
    languageSubtitle: "ru / kk / en бүкіл өнімге қолданылады.",
    signOut: "Шығу",
    empty: "Әзірге бос",
    source: "Source",
    result: "Result",
  },
  en: {
    shellTitle: "Profile",
    shellSubtitle: "ACCOUNT / SETTINGS / SAVED DATA",
    accountState: "Account state",
    accountSubtitle: "Real auth model, loyalty tier, client segment and CRM-ready profile data.",
    loyalty: "Loyalty",
    points: "Points",
    tier: "Tier",
    segment: "Segment",
    editTitle: "Core identity",
    editSubtitle: "Name and phone as the source of checkout and CRM communication.",
    name: "Name",
    phone: "Phone",
    saveProfile: "Save profile",
    addressesTitle: "Saved addresses",
    addressesSubtitle: "Address book for checkout, delivery and repeat purchase flows.",
    cardsTitle: "Saved cards",
    cardsSubtitle: "Payment shortcuts for faster checkout.",
    label: "Label",
    city: "City",
    line1: "Address",
    line2: "Note",
    holder: "Holder",
    brand: "Brand",
    last4: "Last 4 digits",
    create: "Create",
    update: "Update",
    remove: "Remove",
    rewardsTitle: "Rewards",
    rewardsSubtitle: "Loyalty rewards and premium benefits by tier.",
    repeatOrdersTitle: "Repeat order",
    repeatOrdersSubtitle: "Delivered orders can be relaunched without rebuilding checkout.",
    repeatOrder: "Repeat order",
    tryOnsTitle: "AI try-on history",
    tryOnsSubtitle: "Saved try-ons and generation results.",
    trackerTitle: "Order tracker",
    trackerSubtitle: "Live active-order status across the operational chain.",
    themeTitle: "Theme",
    themeSubtitle: "Light / dark switching persists as a user preference.",
    languageTitle: "Language",
    languageSubtitle: "ru / kk / en apply across the whole product.",
    signOut: "Sign out",
    empty: "Nothing here yet",
    source: "Source",
    result: "Result",
  },
};

const EMPTY_ADDRESS: SavedAddressPayload = {
  label: "",
  city: "",
  line1: "",
  line2: "",
  isDefault: false,
};

const EMPTY_CARD: SavedPaymentCardPayload = {
  brand: "",
  holderName: "",
  last4: "",
  isDefault: false,
};

export default function ProfileScreen() {
  const theme = useResolvedTheme();
  const { width } = useWindowDimensions();
  
  const insets = useSafeAreaInsets();
  
  const extraBottomPadding = Platform.OS === "web" ? 0 : insets.bottom + 80;

  const user = useAppStore((state) => state.user);
  const activeOrder = useAppStore((state) => state.activeOrder);
  const tryOnSessions = useAppStore((state) => state.tryOnSessions);
  const savedAddresses = useAppStore((state) => state.savedAddresses);
  const savedCards = useAppStore((state) => state.savedCards);
  const rewards = useAppStore((state) => state.rewards);
  const orders = useAppStore((state) => state.orders);
  const logout = useAppStore((state) => state.logout);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const createAddress = useAppStore((state) => state.createAddress);
  const updateAddress = useAppStore((state) => state.updateAddress);
  const deleteAddress = useAppStore((state) => state.deleteAddress);
  const createCard = useAppStore((state) => state.createCard);
  const updateCard = useAppStore((state) => state.updateCard);
  const deleteCard = useAppStore((state) => state.deleteCard);
  const repeatOrder = useAppStore((state) => state.repeatOrder);
  const language = useAppStore((state) => state.language);
  const copy = COPY[language];
  const isCompact = width < 760;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressDraft, setAddressDraft] = useState<SavedAddressPayload>(EMPTY_ADDRESS);
  const [cardDraft, setCardDraft] = useState<SavedPaymentCardPayload>(EMPTY_CARD);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name);
    setPhone(user.phone ?? "");
  }, [user]);

  const deliveredOrders = useMemo(() => orders.filter((order) => order.status === "delivered").slice(0, 3), [orders]);

  if (!user) {
    return <Redirect href="/login" />;
  }

  async function handleSaveAddress() {
    if (editingAddressId) {
      await updateAddress(editingAddressId, addressDraft);
    } else {
      await createAddress(addressDraft);
    }

    setEditingAddressId(null);
    setAddressDraft(EMPTY_ADDRESS);
  }

  async function handleSaveCard() {
    if (editingCardId) {
      await updateCard(editingCardId, cardDraft);
    } else {
      await createCard(cardDraft);
    }

    setEditingCardId(null);
    setCardDraft(EMPTY_CARD);
  }

  return (
    <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle}>
      {/* 3. СЕНЬОРСКИЙ АПДЕЙТ: Применяем кроссплатформенный отступ. 
          Берем 24 (дефолт из стилей) и прибавляем наш extraBottomPadding */}
      <ScrollView 
        contentContainerStyle={[
          styles.container, 
          { paddingBottom: 24 + extraBottomPadding }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        <Panel style={styles.identity}>
          <View style={[styles.identityGrid, isCompact && styles.identityGridCompact]}>
            <View style={[styles.identityCopy, isCompact && styles.identityCopyCompact]}>
              <StatusPill label={`${user.role.toUpperCase()} / LIVE ACCOUNT`} tone="solid" />
              <Text style={[styles.name, isCompact && styles.nameCompact, { color: theme.colors.textPrimary }]}>
                {user.name.toUpperCase()}
              </Text>
              <Text style={[styles.role, { color: theme.colors.textSecondary }]}>{user.email}</Text>

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

              <View style={styles.identityMetaGrid}>
                <View style={[styles.identityMeta, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.points}</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>{user.loyaltyPoints}</Text>
                </View>
                <View style={[styles.identityMeta, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.tier}</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>{user.loyaltyTier.toUpperCase()}</Text>
                </View>
                <View style={[styles.identityMeta, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.segment}</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>{user.segment}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.identityVisual, isCompact && styles.identityVisualCompact, { borderColor: theme.colors.borderSoft }]}>
              <Image source={user.avatarUrl ? { uri: user.avatarUrl } : referenceTechJacket} style={styles.visualImage} resizeMode="cover" />
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
            <SectionHeading title={copy.accountState} subtitle={copy.accountSubtitle} compact />
            <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
              {copy.loyalty}: {user.loyaltyProgress}% / {copy.points}: {user.loyaltyPoints}
            </Text>
          </Panel>
        </View>

        <Panel style={styles.editorPanel}>
          <SectionHeading title={copy.editTitle} subtitle={copy.editSubtitle} compact />
          <View style={styles.editorGrid}>
            <MonoInput label={copy.name} value={name} onChangeText={setName} placeholder={copy.name} />
            <MonoInput label={copy.phone} value={phone} onChangeText={setPhone} placeholder="+7 ..." keyboardType="phone-pad" />
          </View>
          <MonoButton label={copy.saveProfile} onPress={() => updateProfile({ name, phone })} />
        </Panel>

        <View style={styles.grid}>
          <Panel style={styles.entityPanel}>
            <SectionHeading title={copy.addressesTitle} subtitle={copy.addressesSubtitle} compact />
            <MonoInput label={copy.label} value={addressDraft.label} onChangeText={(value) => setAddressDraft((current) => ({ ...current, label: value }))} />
            <MonoInput label={copy.city} value={addressDraft.city} onChangeText={(value) => setAddressDraft((current) => ({ ...current, city: value }))} />
            <MonoInput label={copy.line1} value={addressDraft.line1} onChangeText={(value) => setAddressDraft((current) => ({ ...current, line1: value }))} multiline />
            <MonoInput label={copy.line2} value={addressDraft.line2 ?? ""} onChangeText={(value) => setAddressDraft((current) => ({ ...current, line2: value }))} />
            <MonoButton label={editingAddressId ? copy.update : copy.create} onPress={handleSaveAddress} />
            <View style={styles.stack}>
              {savedAddresses.length ? (
                savedAddresses.map((address) => (
                  <View key={address.id} style={[styles.entityCard, { borderColor: theme.colors.borderSoft }]}>
                    <Text style={[styles.entityTitle, { color: theme.colors.textPrimary }]}>{address.label}</Text>
                    <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
                      {address.city}, {address.line1}
                    </Text>
                    <View style={styles.row}>
                      <MonoButton
                        label={copy.update}
                        variant="secondary"
                        onPress={() => {
                          setEditingAddressId(address.id);
                          setAddressDraft({
                            label: address.label,
                            city: address.city,
                            line1: address.line1,
                            line2: address.line2 ?? "",
                            isDefault: address.isDefault,
                          });
                        }}
                      />
                      <MonoButton label={copy.remove} variant="secondary" onPress={() => deleteAddress(address.id)} />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{copy.empty}</Text>
              )}
            </View>
          </Panel>

          <Panel style={styles.entityPanel}>
            <SectionHeading title={copy.cardsTitle} subtitle={copy.cardsSubtitle} compact />
            <MonoInput label={copy.brand} value={cardDraft.brand} onChangeText={(value) => setCardDraft((current) => ({ ...current, brand: value }))} />
            <MonoInput label={copy.holder} value={cardDraft.holderName} onChangeText={(value) => setCardDraft((current) => ({ ...current, holderName: value }))} />
            <MonoInput label={copy.last4} value={cardDraft.last4} onChangeText={(value) => setCardDraft((current) => ({ ...current, last4: value.replace(/\D/g, "").slice(0, 4) }))} keyboardType="number-pad" />
            <MonoButton label={editingCardId ? copy.update : copy.create} onPress={handleSaveCard} />
            <View style={styles.stack}>
              {savedCards.length ? (
                savedCards.map((card) => (
                  <View key={card.id} style={[styles.entityCard, { borderColor: theme.colors.borderSoft }]}>
                    <Text style={[styles.entityTitle, { color: theme.colors.textPrimary }]}>{card.brand} •••• {card.last4}</Text>
                    <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{card.holderName}</Text>
                    <View style={styles.row}>
                      <MonoButton
                        label={copy.update}
                        variant="secondary"
                        onPress={() => {
                          setEditingCardId(card.id);
                          setCardDraft({
                            brand: card.brand,
                            holderName: card.holderName,
                            last4: card.last4,
                            isDefault: card.isDefault,
                          });
                        }}
                      />
                      <MonoButton label={copy.remove} variant="secondary" onPress={() => deleteCard(card.id)} />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{copy.empty}</Text>
              )}
            </View>
          </Panel>
        </View>

        <View style={styles.grid}>
          <Panel style={styles.settingsPanel}>
            <SectionHeading title={copy.rewardsTitle} subtitle={copy.rewardsSubtitle} compact />
            <View style={styles.stack}>
              {rewards.length ? (
                rewards.map((reward) => (
                  <View key={reward.id} style={[styles.entityCard, { borderColor: theme.colors.borderSoft }]}>
                    <Text style={[styles.entityTitle, { color: theme.colors.textPrimary }]}>{reward.title}</Text>
                    <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{reward.description}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{copy.empty}</Text>
              )}
            </View>
          </Panel>

          <Panel style={styles.settingsPanel}>
            <SectionHeading title={copy.repeatOrdersTitle} subtitle={copy.repeatOrdersSubtitle} compact />
            <View style={styles.stack}>
              {deliveredOrders.length ? (
                deliveredOrders.map((order) => (
                  <View key={order.id} style={[styles.entityCard, { borderColor: theme.colors.borderSoft }]}>
                    <Text style={[styles.entityTitle, { color: theme.colors.textPrimary }]}>{order.productName}</Text>
                    <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{order.number} / {order.totalFormatted}</Text>
                    <MonoButton label={copy.repeatOrder} onPress={() => repeatOrder(order.id)} />
                  </View>
                ))
              ) : (
                <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{copy.empty}</Text>
              )}
            </View>
          </Panel>
        </View>

        {user.role === "client" ? (
          <Panel>
            <SectionHeading title={copy.tryOnsTitle} subtitle={copy.tryOnsSubtitle} compact />
            <View style={styles.tryOnGrid}>
              {tryOnSessions.length ? (
                tryOnSessions.map((session) => (
                  <View key={session.id} style={[styles.tryOnCard, { borderColor: theme.colors.borderSoft }]}>
                    <View style={styles.tryOnVisualRow}>
                      <View style={styles.tryOnVisual}>
                        <Image source={{ uri: session.sourceImageUrl }} style={styles.tryOnImage} resizeMode="cover" />
                        <Text style={[styles.tryOnMeta, { color: theme.colors.textMuted }]}>{copy.source}</Text>
                      </View>
                      <View style={styles.tryOnVisual}>
                        <Image source={{ uri: session.resultImageUrl ?? session.sourceImageUrl }} style={styles.tryOnImage} resizeMode="cover" />
                        <Text style={[styles.tryOnMeta, { color: theme.colors.textMuted }]}>{copy.result}</Text>
                      </View>
                    </View>
                    <View style={styles.tryOnCopy}>
                      <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{session.notes}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{copy.empty}</Text>
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
    flexDirection: "column-reverse",
    flexWrap: "nowrap", 
  },
  identityCopy: {
    flex: 1,
    minWidth: 300,
    gap: 16,
  },
  identityCopyCompact: {
    minWidth: "100%", 
    flex: 0, 
  },
  name: {
    fontFamily: "Oswald_500Medium",
    fontSize: 46,
    letterSpacing: 1.8,
  },
  nameCompact: {
    fontSize: 34,
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
    minHeight: 360,
    borderWidth: 1,
    borderRadius: 26,
    overflow: "hidden",
  },
  identityVisualCompact: {
    flex: 0,
    width: "100%",
    minWidth: "100%",
    height: 380, 
  },
  visualImage: {
    flex: 1,
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
  editorPanel: {
    gap: 16,
  },
  editorGrid: {
    gap: 12,
  },
  entityPanel: {
    flex: 1,
    minWidth: 320,
    gap: 12,
  },
  stack: {
    gap: 10,
  },
  entityCard: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 8,
  },
  entityTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    letterSpacing: 0.8,
  },
  summaryText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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
  tryOnVisualRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tryOnVisual: {
    flex: 1,
    minWidth: 220,
    aspectRatio: 4 / 5,
  },
  tryOnImage: {
    width: "100%",
    height: "100%",
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
  },
});