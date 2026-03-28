import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceChip } from "../../../src/components/ChoiceChip";
import { MonoButton } from "../../../src/components/MonoButton";
import { MonoInput } from "../../../src/components/MonoInput";
import { Panel } from "../../../src/components/Panel";
import { ScreenShell } from "../../../src/components/ScreenShell";
import { SectionHeading } from "../../../src/components/SectionHeading";
import { StatusPill } from "../../../src/components/StatusPill";
import { referenceTechJacket } from "../../../src/lib/brandArt";
import { useResolvedTheme } from "../../../src/lib/theme";
import { useRequireRole } from "../../../src/lib/useRequireRole";
import { useAppStore } from "../../../src/store/useAppStore";
import { AppLanguage, DeliveryMethod, PaymentMethod } from "../../../src/types";

const PAYMENT_METHODS: PaymentMethod[] = ["card", "kaspi", "transfer"];
const DELIVERY_METHODS: DeliveryMethod[] = ["pickup", "courier"];

const COPY: Record<
  AppLanguage,
  {
    shellPayment: string;
    shellConfirmation: string;
    headerMeta: string;
    confirmedTitle: string;
    confirmedSubtitle: string;
    status: string;
    payment: string;
    delivery: string;
    address: string;
    openProfile: string;
    backToClient: string;
    realCheckout: string;
    realCheckoutSubtitle: string;
    paymentMethod: string;
    deliveryMethod: string;
    shippingAddress: string;
    contactPhone: string;
    notes: string;
    shippingPlaceholder: string;
    phonePlaceholder: string;
    notesPlaceholder: string;
    preorderDate: string;
    linkedTryOn: string;
    placing: string;
    confirm: string;
    back: string;
    size: string;
  }
> = {
  ru: {
    shellPayment: "ОПЛАТА",
    shellConfirmation: "ПОДТВЕРЖДЕНИЕ",
    headerMeta: "КЛИЕНТСКИЙ ПОТОК / СЛЕДУЮЩИЙ ЭТАП ГОТОВ",
    confirmedTitle: "ЗАКАЗ ПОДТВЕРЖДЕН",
    confirmedSubtitle: "Заказ уже записан в live-операции и виден бизнес-ролям.",
    status: "СТАТУС",
    payment: "ОПЛАТА",
    delivery: "ДОСТАВКА",
    address: "АДРЕС",
    openProfile: "ОТКРЫТЬ ПРОФИЛЬ",
    backToClient: "НАЗАД К ВИТРИНЕ",
    realCheckout: "РЕАЛЬНЫЙ CHECKOUT",
    realCheckoutSubtitle: "Шаг теперь фиксирует оплату, доставку, адрес и связь с try-on историей.",
    paymentMethod: "СПОСОБ ОПЛАТЫ",
    deliveryMethod: "СПОСОБ ДОСТАВКИ",
    shippingAddress: "АДРЕС ДОСТАВКИ",
    contactPhone: "КОНТАКТНЫЙ ТЕЛЕФОН",
    notes: "ПРИМЕЧАНИЯ",
    shippingPlaceholder: "Город, улица, дом, квартира",
    phonePlaceholder: "+7 ...",
    notesPlaceholder: "Комментарии к упаковке, посадке или доставке",
    preorderDate: "ДАТА ПРЕДЗАКАЗА",
    linkedTryOn: "СВЯЗАННЫЙ TRY-ON",
    placing: "СОЗДАНИЕ ЗАКАЗА...",
    confirm: "ПОДТВЕРДИТЬ ЗАКАЗ",
    back: "НАЗАД",
    size: "Размер",
  },
  kk: {
    shellPayment: "ТӨЛЕМ",
    shellConfirmation: "РАСТАУ",
    headerMeta: "КЛИЕНТ АҒЫНЫ / КЕЛЕСІ КЕЗЕҢ ДАЙЫН",
    confirmedTitle: "ТАПСЫРЫС РАСТАЛДЫ",
    confirmedSubtitle: "Тапсырыс live-операцияларға жазылды және бизнес-рөлдерге көрінеді.",
    status: "СТАТУС",
    payment: "ТӨЛЕМ",
    delivery: "ЖЕТКІЗУ",
    address: "МЕКЕНЖАЙ",
    openProfile: "ПРОФИЛЬДІ АШУ",
    backToClient: "ВИТРИНАҒА ҚАЙТУ",
    realCheckout: "НАҚТЫ CHECKOUT",
    realCheckoutSubtitle: "Бұл қадам төлемді, жеткізуді, мекенжайды және try-on тарихымен байланысты сақтайды.",
    paymentMethod: "ТӨЛЕМ ӘДІСІ",
    deliveryMethod: "ЖЕТКІЗУ ӘДІСІ",
    shippingAddress: "ЖЕТКІЗУ МЕКЕНЖАЙЫ",
    contactPhone: "БАЙЛАНЫС ТЕЛЕФОНЫ",
    notes: "ЕСКЕРТПЕ",
    shippingPlaceholder: "Қала, көше, үй, пәтер",
    phonePlaceholder: "+7 ...",
    notesPlaceholder: "Қаптама, отырымы немесе жеткізу туралы ескерту",
    preorderDate: "АЛДЫН АЛА ТАПСЫРЫС КҮНІ",
    linkedTryOn: "БАЙЛАНҒАН TRY-ON",
    placing: "ТАПСЫРЫС ЖАСАЛУДА...",
    confirm: "ТАПСЫРЫСТЫ РАСТАУ",
    back: "АРТҚА",
    size: "Өлшем",
  },
  en: {
    shellPayment: "PAYMENT",
    shellConfirmation: "CONFIRMATION",
    headerMeta: "CLIENT FLOW / NEXT STAGE READY",
    confirmedTitle: "ORDER CONFIRMED",
    confirmedSubtitle: "The order is already written into live operations and visible to business roles.",
    status: "STATUS",
    payment: "PAYMENT",
    delivery: "DELIVERY",
    address: "ADDRESS",
    openProfile: "OPEN PROFILE",
    backToClient: "BACK TO CLIENT",
    realCheckout: "REAL CHECKOUT",
    realCheckoutSubtitle: "This step captures payment, delivery, address and try-on linkage when available.",
    paymentMethod: "PAYMENT METHOD",
    deliveryMethod: "DELIVERY METHOD",
    shippingAddress: "SHIPPING ADDRESS",
    contactPhone: "CONTACT PHONE",
    notes: "NOTES",
    shippingPlaceholder: "City, street, house, apartment",
    phonePlaceholder: "+7 ...",
    notesPlaceholder: "Packaging, fitting or delivery notes",
    preorderDate: "PREORDER DATE",
    linkedTryOn: "LINKED TRY-ON",
    placing: "PLACING ORDER...",
    confirm: "CONFIRM ORDER",
    back: "BACK",
    size: "Size",
  },
};

export default function CheckoutScreen() {
  const redirect = useRequireRole("client");
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const params = useLocalSearchParams<{
    id: string;
    variantId?: string;
    scheduledDate?: string;
    tryOnId?: string;
  }>();
  const products = useAppStore((state) => state.products);
  const orders = useAppStore((state) => state.orders);
  const user = useAppStore((state) => state.user);
  const placeOrder = useAppStore((state) => state.placeOrder);
  const copy = COPY[language];
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("kaspi");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("courier");
  const [shippingAddress, setShippingAddress] = useState(user?.defaultShippingAddress ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingOrder = orders.find((item) => item.id === params.id);
  const product = useMemo(
    () => products.find((item) => item.id === params.id),
    [params.id, products],
  );

  useEffect(() => {
    if (deliveryMethod === "pickup") {
      setShippingAddress("Almaty flagship pickup point");
      return;
    }

    setShippingAddress(user?.defaultShippingAddress ?? "");
  }, [deliveryMethod, user?.defaultShippingAddress]);

  if (redirect) {
    return redirect;
  }

  if (existingOrder) {
    return (
      <ScreenShell title={copy.shellPayment} subtitle={copy.shellConfirmation} profileRoute="/profile">
        <View style={styles.container}>
          <Panel style={styles.panel}>
            <View style={styles.header}>
              <StatusPill label="ORDER LOCKED / LIVE SYNC" tone="solid" />
              <Text style={[styles.headerMeta, { color: theme.colors.textMuted }]}>{copy.headerMeta}</Text>
            </View>

            <View style={styles.grid}>
              <View style={[styles.checkoutVisual, { borderColor: theme.colors.borderSoft }]}>
                <Image
                  source={existingOrder.productMediaUrl ? { uri: existingOrder.productMediaUrl } : referenceTechJacket}
                  style={styles.visualImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.copyBlock}>
                <SectionHeading title={copy.confirmedTitle} subtitle={copy.confirmedSubtitle} />

                <Text style={[styles.orderCode, { color: theme.colors.textPrimary }]}>
                  {existingOrder.number}
                </Text>

                <Text style={[styles.copyText, { color: theme.colors.textSecondary }]}>
                  {existingOrder.productName} / {existingOrder.totalFormatted}
                </Text>

                <View style={styles.infoRows}>
                  {[
                    [copy.status, existingOrder.status.replaceAll("_", " ").toUpperCase()],
                    [copy.payment, existingOrder.paymentMethod.toUpperCase()],
                    [copy.delivery, existingOrder.deliveryMethod.toUpperCase()],
                    [copy.address, existingOrder.shippingAddress],
                  ].map(([label, value]) => (
                    <View key={label} style={[styles.infoRow, { borderColor: theme.colors.borderSoft }]}>
                      <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>{label}</Text>
                      <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>{value}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.actions}>
                  <MonoButton label={copy.openProfile} onPress={() => router.push("/profile")} />
                  <MonoButton label={copy.backToClient} variant="secondary" onPress={() => router.replace("/client")} />
                </View>
              </View>
            </View>
          </Panel>
        </View>
      </ScreenShell>
    );
  }

  if (!product) {
    return null;
  }

  const selectedVariant = product.variants.find((variant) => variant.id === params.variantId) ?? product.variants[0];

  return (
    <ScreenShell title={copy.shellPayment} subtitle={product.name} profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          <Panel style={styles.checkoutVisual}>
            <Image
              source={product.media[0]?.url ? { uri: product.media[0].url } : referenceTechJacket}
              style={styles.visualImage}
              resizeMode="cover"
            />
            <View style={styles.visualMetaWrap}>
              <StatusPill label={`${product.categoryName.toUpperCase()} / ${product.sku}`} tone="ghost" />
              <Text style={[styles.visualHeadline, { color: theme.colors.textPrimary }]}>
                {product.formattedPrice}
              </Text>
            </View>
          </Panel>

          <Panel style={styles.checkoutForm}>
            <SectionHeading title={copy.realCheckout} subtitle={copy.realCheckoutSubtitle} />

            <View style={styles.summaryBlock}>
              <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>{product.name}</Text>
              <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
                {copy.size} {selectedVariant?.sizeLabel ?? "N/A"} / {product.formattedPrice}
              </Text>
            </View>

            <View style={styles.selectionBlock}>
              <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>{copy.paymentMethod}</Text>
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
              <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>{copy.deliveryMethod}</Text>
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
              label={copy.shippingAddress}
              value={shippingAddress}
              onChangeText={setShippingAddress}
              multiline
              placeholder={copy.shippingPlaceholder}
            />
            <MonoInput
              label={copy.contactPhone}
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

            <View style={styles.infoRows}>
              {params.scheduledDate ? (
                <View style={[styles.infoRow, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>{copy.preorderDate}</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>{params.scheduledDate}</Text>
                </View>
              ) : null}
              {params.tryOnId ? (
                <View style={[styles.infoRow, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>{copy.linkedTryOn}</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>{params.tryOnId}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.actions}>
              <MonoButton
                label={isSubmitting ? copy.placing : copy.confirm}
                onPress={async () => {
                  if (!selectedVariant) {
                    return;
                  }

                  setIsSubmitting(true);

                  try {
                    const order = await placeOrder({
                      productId: product.id,
                      variantId: selectedVariant.id,
                      paymentMethod,
                      deliveryMethod,
                      shippingAddress,
                      contactPhone,
                      scheduledDate: params.scheduledDate,
                      notes,
                      tryOnId: params.tryOnId,
                    });

                    router.replace(`/client/checkout/${order.id}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              />
              <MonoButton label={copy.back} variant="secondary" onPress={() => router.back()} />
            </View>
          </Panel>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    gap: 18,
    paddingBottom: 24,
  },
  panel: {
    maxWidth: 1080,
    alignSelf: "center",
    width: "100%",
    gap: 18,
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  headerMeta: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  checkoutVisual: {
    flex: 0.9,
    minWidth: 300,
    minHeight: 520,
    padding: 0,
    overflow: "hidden",
  },
  visualImage: {
    width: "100%",
    height: "100%",
  },
  visualMetaWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    gap: 12,
  },
  visualHeadline: {
    fontFamily: "Oswald_500Medium",
    fontSize: 44,
    letterSpacing: 1.2,
  },
  checkoutForm: {
    flex: 1,
    minWidth: 300,
    gap: 16,
  },
  summaryBlock: {
    gap: 4,
  },
  summaryTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 34,
    letterSpacing: 0.8,
  },
  summaryText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  selectionBlock: {
    gap: 10,
  },
  selectionLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  copyBlock: {
    flex: 1,
    minWidth: 300,
    gap: 18,
  },
  orderCode: {
    fontFamily: "Oswald_500Medium",
    fontSize: 54,
    letterSpacing: 2,
  },
  copyText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  infoRows: {
    gap: 10,
  },
  infoRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 6,
  },
  infoLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  infoValue: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
