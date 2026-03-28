import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { ChoiceChip } from "../../src/components/ChoiceChip";
import { MonoButton } from "../../src/components/MonoButton";
import { MonoInput } from "../../src/components/MonoInput";
import { Panel } from "../../src/components/Panel";
import { ScreenShell } from "../../src/components/ScreenShell";
import { SectionHeading } from "../../src/components/SectionHeading";
import { StatusPill } from "../../src/components/StatusPill";
import { referenceTechJacket } from "../../src/lib/brandArt";
import { useResolvedTheme } from "../../src/lib/theme";
import { useRequireRole } from "../../src/lib/useRequireRole";
import { useAppStore } from "../../src/store/useAppStore";
import { AppLanguage, DeliveryMethod, PaymentMethod } from "../../src/types";

const PAYMENT_METHODS: PaymentMethod[] = ["card", "kaspi", "transfer"];
const DELIVERY_METHODS: DeliveryMethod[] = ["pickup", "courier"];

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    shellSubtitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    backToCatalog: string;
    cartTitle: string;
    cartSubtitle: string;
    payment: string;
    delivery: string;
    address: string;
    phone: string;
    notes: string;
    addressPlaceholder: string;
    phonePlaceholder: string;
    notesPlaceholder: string;
    remove: string;
    clear: string;
    minus: string;
    plus: string;
    size: string;
    qty: string;
    checkout: string;
    checkingOut: string;
    success: string;
    openProfile: string;
    total: string;
  }
> = {
  ru: {
    shellTitle: "КОРЗИНА",
    shellSubtitle: "СОСТАВ / ДОСТАВКА / ОПЛАТА",
    emptyTitle: "КОРЗИНА ПУСТА",
    emptySubtitle: "Добавь товары из каталога, чтобы перейти к полноценному checkout-потоку.",
    backToCatalog: "В КАТАЛОГ",
    cartTitle: "ВАШ СТОРИТЕЛЛИНГ-ЧЕКАУТ",
    cartSubtitle: "Собранный набор, адрес, оплата и связка с профилем в одном шаге.",
    payment: "СПОСОБ ОПЛАТЫ",
    delivery: "СПОСОБ ДОСТАВКИ",
    address: "АДРЕС",
    phone: "ТЕЛЕФОН",
    notes: "ПРИМЕЧАНИЯ",
    addressPlaceholder: "Город, улица, дом, квартира",
    phonePlaceholder: "+7 ...",
    notesPlaceholder: "Комментарий к упаковке, примерке или доставке",
    remove: "УДАЛИТЬ",
    clear: "ОЧИСТИТЬ КОРЗИНУ",
    minus: "−",
    plus: "+",
    size: "РАЗМЕР",
    qty: "КОЛ-ВО",
    checkout: "ОФОРМИТЬ ЗАКАЗ",
    checkingOut: "ОФОРМЛЕНИЕ...",
    success: "Заказы созданы и уже попали в live-операции.",
    openProfile: "ОТКРЫТЬ ПРОФИЛЬ",
    total: "ИТОГО",
  },
  kk: {
    shellTitle: "СЕБЕТ",
    shellSubtitle: "ҚҰРАМ / ЖЕТКІЗУ / ТӨЛЕМ",
    emptyTitle: "СЕБЕТ БОС",
    emptySubtitle: "Толық checkout ағынына өту үшін каталогтан тауар қосыңыз.",
    backToCatalog: "КАТАЛОГҚА",
    cartTitle: "СІЗДІҢ STORYTELLING-CHECKOUT",
    cartSubtitle: "Жиналған пакет, мекенжай, төлем және профильмен байланыс бір қадамда.",
    payment: "ТӨЛЕМ ӘДІСІ",
    delivery: "ЖЕТКІЗУ ӘДІСІ",
    address: "МЕКЕНЖАЙ",
    phone: "ТЕЛЕФОН",
    notes: "ЕСКЕРТПЕ",
    addressPlaceholder: "Қала, көше, үй, пәтер",
    phonePlaceholder: "+7 ...",
    notesPlaceholder: "Қаптама, fitting немесе жеткізу бойынша ескерту",
    remove: "ӨШІРУ",
    clear: "СЕБЕТТІ ТАЗАЛАУ",
    minus: "−",
    plus: "+",
    size: "ӨЛШЕМ",
    qty: "САНЫ",
    checkout: "ТАПСЫРЫСТЫ РАСТАУ",
    checkingOut: "РӘСІМДЕЛУДЕ...",
    success: "Тапсырыстар жасалды және live-операцияларға жіберілді.",
    openProfile: "ПРОФИЛЬДІ АШУ",
    total: "ЖАЛПЫ",
  },
  en: {
    shellTitle: "CART",
    shellSubtitle: "SELECTION / DELIVERY / PAYMENT",
    emptyTitle: "CART IS EMPTY",
    emptySubtitle: "Add products from the catalog to move into the full checkout flow.",
    backToCatalog: "BACK TO CATALOG",
    cartTitle: "YOUR STORYTELLING CHECKOUT",
    cartSubtitle: "Curated basket, address, payment and profile linkage in one step.",
    payment: "PAYMENT METHOD",
    delivery: "DELIVERY METHOD",
    address: "ADDRESS",
    phone: "PHONE",
    notes: "NOTES",
    addressPlaceholder: "City, street, house, apartment",
    phonePlaceholder: "+7 ...",
    notesPlaceholder: "Packaging, fitting or delivery notes",
    remove: "REMOVE",
    clear: "CLEAR CART",
    minus: "−",
    plus: "+",
    size: "SIZE",
    qty: "QTY",
    checkout: "PLACE ORDER",
    checkingOut: "PLACING...",
    success: "Orders were created and pushed into live operations.",
    openProfile: "OPEN PROFILE",
    total: "TOTAL",
  },
};

export default function CartScreen() {
  const redirect = useRequireRole("client");
  const theme = useResolvedTheme();
  const { width } = useWindowDimensions();
  const language = useAppStore((state) => state.language);
  const cartItems = useAppStore((state) => state.cartItems);
  const products = useAppStore((state) => state.products);
  const user = useAppStore((state) => state.user);
  const updateCartQuantity = useAppStore((state) => state.updateCartQuantity);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const clearCart = useAppStore((state) => state.clearCart);
  const placeOrder = useAppStore((state) => state.placeOrder);
  const copy = COPY[language];
  const isCompact = width < 760;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("kaspi");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("courier");
  const [shippingAddress, setShippingAddress] = useState(user?.defaultShippingAddress ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setShippingAddress(user?.defaultShippingAddress ?? "");
    setContactPhone(user?.phone ?? "");
  }, [user]);

  if (redirect) {
    return redirect;
  }

  const cartDetails = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          const variant = product?.variants.find((entry) => entry.id === item.variantId);

          if (!product || !variant) {
            return null;
          }

          return {
            item,
            product,
            variant,
            total: product.priceAmount * item.quantity,
          };
        })
        .filter(Boolean),
    [cartItems, products],
  );

  const totalAmount = cartDetails.reduce((sum, entry) => sum + (entry?.total ?? 0), 0);

  if (!cartDetails.length) {
    return (
      <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle} profileRoute="/profile">
        <View style={styles.emptyWrap}>
          <Panel style={styles.emptyPanel}>
            <SectionHeading title={copy.emptyTitle} subtitle={copy.emptySubtitle} />
            <MonoButton label={copy.backToCatalog} onPress={() => router.replace("/client")} />
          </Panel>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle} profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.grid, isCompact && styles.gridCompact]}>
          <Panel style={styles.listPanel}>
            <SectionHeading title={copy.cartTitle} subtitle={copy.cartSubtitle} compact />

            <View style={styles.itemList}>
              {cartDetails.map((entry) => {
                if (!entry) {
                  return null;
                }

                return (
                  <View
                    key={entry.item.id}
                    style={[
                      styles.itemCard,
                      isCompact && styles.itemCardCompact,
                      {
                        borderColor: theme.colors.borderSoft,
                        backgroundColor: theme.colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Image
                      source={entry.product.media[0]?.url ? { uri: entry.product.media[0].url } : referenceTechJacket}
                      style={[styles.itemImage, isCompact && styles.itemImageCompact]}
                      resizeMode="cover"
                    />

                    <View style={styles.itemCopy}>
                      <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
                        {entry.product.name}
                      </Text>
                      <Text style={[styles.itemText, { color: theme.colors.textSecondary }]}>
                        {copy.size} / {entry.variant.sizeLabel}
                      </Text>
                      <Text style={[styles.itemText, { color: theme.colors.textSecondary }]}>
                        {entry.product.formattedPrice}
                      </Text>

                      <View style={styles.quantityRow}>
                        <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>{copy.qty}</Text>
                        <View style={styles.quantityControls}>
                          <ChoiceChip
                            label={copy.minus}
                            active={false}
                            onPress={() => updateCartQuantity(entry.item.id, entry.item.quantity - 1)}
                          />
                          <Text style={[styles.quantityValue, { color: theme.colors.textPrimary }]}>
                            {entry.item.quantity}
                          </Text>
                          <ChoiceChip
                            label={copy.plus}
                            active={false}
                            onPress={() => updateCartQuantity(entry.item.id, entry.item.quantity + 1)}
                          />
                        </View>
                      </View>
                    </View>

                    <View style={styles.itemActions}>
                      <Text style={[styles.totalValue, { color: theme.colors.textPrimary }]}>
                        {new Intl.NumberFormat(language === "en" ? "en-US" : language === "kk" ? "kk-KZ" : "ru-RU").format(entry.total)} ₸
                      </Text>
                      <MonoButton label={copy.remove} variant="secondary" onPress={() => removeFromCart(entry.item.id)} />
                    </View>
                  </View>
                );
              })}
            </View>

            <MonoButton label={copy.clear} variant="secondary" onPress={clearCart} />
          </Panel>

          <Panel style={styles.checkoutPanel}>
            <StatusPill label={`${copy.total} / ${new Intl.NumberFormat(language === "en" ? "en-US" : language === "kk" ? "kk-KZ" : "ru-RU").format(totalAmount)} ₸`} tone="solid" />

            <View style={styles.selectionBlock}>
              <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>{copy.payment}</Text>
              <View style={styles.choiceRow}>
                {PAYMENT_METHODS.map((item) => (
                  <ChoiceChip
                    key={item}
                    label={item.toUpperCase()}
                    active={paymentMethod === item}
                    onPress={() => setPaymentMethod(item)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.selectionBlock}>
              <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>{copy.delivery}</Text>
              <View style={styles.choiceRow}>
                {DELIVERY_METHODS.map((item) => (
                  <ChoiceChip
                    key={item}
                    label={item.toUpperCase()}
                    active={deliveryMethod === item}
                    onPress={() => setDeliveryMethod(item)}
                  />
                ))}
              </View>
            </View>

            <MonoInput
              label={copy.address}
              value={shippingAddress}
              onChangeText={setShippingAddress}
              multiline
              placeholder={copy.addressPlaceholder}
            />
            <MonoInput
              label={copy.phone}
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              placeholder={copy.phonePlaceholder}
            />
            <MonoInput
              label={copy.notes}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder={copy.notesPlaceholder}
            />

            {successMessage ? (
              <Text style={[styles.successText, { color: theme.colors.textSecondary }]}>{successMessage}</Text>
            ) : null}

            <View style={styles.actionRow}>
              <MonoButton
                label={isSubmitting ? copy.checkingOut : copy.checkout}
                onPress={async () => {
                  setIsSubmitting(true);
                  try {
                    let createdCount = 0;

                    for (const entry of cartDetails) {
                      if (!entry) {
                        continue;
                      }

                      for (let count = 0; count < entry.item.quantity; count += 1) {
                        await placeOrder({
                          productId: entry.product.id,
                          variantId: entry.variant.id,
                          deliveryMethod,
                          paymentMethod,
                          shippingAddress,
                          contactPhone,
                          scheduledDate: entry.item.scheduledDate,
                          notes,
                          tryOnId: entry.item.tryOnId,
                        });
                        createdCount += 1;
                      }
                    }

                    clearCart();
                    setSuccessMessage(`${copy.success} / ${createdCount}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              />
              <MonoButton label={copy.openProfile} variant="secondary" onPress={() => router.push("/profile")} />
            </View>
          </Panel>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 24,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
  },
  emptyPanel: {
    maxWidth: 620,
    width: "100%",
    alignSelf: "center",
    gap: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    alignItems: "flex-start",
  },
  gridCompact: {
    gap: 14,
  },
  listPanel: {
    flex: 1.05,
    minWidth: 320,
    gap: 16,
  },
  itemList: {
    gap: 12,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    alignItems: "center",
  },
  itemCardCompact: {
    alignItems: "stretch",
  },
  itemImage: {
    width: 118,
    height: 150,
    borderRadius: 18,
  },
  itemImageCompact: {
    width: "100%",
    height: 220,
  },
  itemCopy: {
    flex: 1,
    minWidth: 220,
    gap: 8,
  },
  itemTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 30,
    letterSpacing: 0.9,
  },
  itemText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    lineHeight: 20,
  },
  itemMeta: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  quantityRow: {
    gap: 8,
    paddingTop: 4,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quantityValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    letterSpacing: 1.1,
    minWidth: 24,
    textAlign: "center",
  },
  itemActions: {
    gap: 10,
    alignItems: "flex-end",
  },
  totalValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 28,
    letterSpacing: 0.9,
  },
  checkoutPanel: {
    flex: 0.92,
    minWidth: 320,
    gap: 16,
  },
  selectionBlock: {
    gap: 10,
  },
  selectionLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  successText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    lineHeight: 20,
  },
});
