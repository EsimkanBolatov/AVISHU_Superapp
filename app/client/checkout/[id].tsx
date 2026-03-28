import { router, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";

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
import { DeliveryMethod, PaymentMethod } from "../../../src/types";

const PAYMENT_METHODS: PaymentMethod[] = ["card", "kaspi", "transfer"];
const DELIVERY_METHODS: DeliveryMethod[] = ["pickup", "courier"];

export default function CheckoutScreen() {
  const redirect = useRequireRole("client");
  const theme = useResolvedTheme();
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("kaspi");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("courier");
  const [shippingAddress, setShippingAddress] = useState(user?.phone ? "Almaty, delivery address" : "");
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
    }
  }, [deliveryMethod]);

  if (redirect) {
    return redirect;
  }

  if (existingOrder) {
    return (
      <ScreenShell title="PAYMENT" subtitle="CONFIRMATION" profileRoute="/profile">
        <View style={styles.container}>
          <Panel style={styles.panel}>
            <View style={styles.header}>
              <StatusPill label="ORDER LOCKED / LIVE SYNC" tone="solid" />
              <Text style={[styles.headerMeta, { color: theme.colors.textMuted }]}>
                CLIENT FLOW / NEXT STAGE READY
              </Text>
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
                <SectionHeading
                  title="ORDER CONFIRMED"
                  subtitle="The order is already written into the live operational flow and visible to business roles."
                />

                <Text style={[styles.orderCode, { color: theme.colors.textPrimary }]}>
                  {existingOrder.number}
                </Text>

                <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>
                  {existingOrder.productName} / {existingOrder.totalFormatted}
                </Text>

                <View style={styles.infoRows}>
                  {[
                    ["STATUS", existingOrder.status.replaceAll("_", " ").toUpperCase()],
                    ["PAYMENT", existingOrder.paymentMethod.toUpperCase()],
                    ["DELIVERY", existingOrder.deliveryMethod.toUpperCase()],
                    ["ADDRESS", existingOrder.shippingAddress],
                  ].map(([label, value]) => (
                    <View key={label} style={[styles.infoRow, { borderColor: theme.colors.borderSoft }]}>
                      <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>{label}</Text>
                      <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>{value}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.actions}>
                  <MonoButton label="OPEN PROFILE" onPress={() => router.push("/profile")} />
                  <MonoButton
                    label="BACK TO CLIENT"
                    variant="secondary"
                    onPress={() => router.replace("/client")}
                  />
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
    <ScreenShell title="CHECKOUT" subtitle={product.name} profileRoute="/profile">
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
            <SectionHeading
              title="REAL CHECKOUT"
              subtitle="This step now captures payment, delivery, address and ties the order to try-on history when available."
            />

            <View style={styles.summaryBlock}>
              <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>
                {product.name}
              </Text>
              <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
                Size {selectedVariant?.sizeLabel ?? "N/A"} / {product.formattedPrice}
              </Text>
            </View>

            <View style={styles.selectionBlock}>
              <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>PAYMENT METHOD</Text>
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
              <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>DELIVERY METHOD</Text>
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
              label="SHIPPING ADDRESS"
              value={shippingAddress}
              onChangeText={setShippingAddress}
              multiline
              placeholder="City, street, house, apartment"
            />
            <MonoInput
              label="CONTACT PHONE"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              placeholder="+7 ..."
            />
            <MonoInput
              label="NOTES"
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Fitting, delivery or packaging notes"
            />

            <View style={styles.infoRows}>
              {params.scheduledDate ? (
                <View style={[styles.infoRow, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>PREORDER DATE</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>
                    {params.scheduledDate}
                  </Text>
                </View>
              ) : null}
              {params.tryOnId ? (
                <View style={[styles.infoRow, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>LINKED TRY-ON</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>
                    {params.tryOnId}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.actions}>
              <MonoButton
                label={isSubmitting ? "PLACING ORDER..." : "CONFIRM ORDER"}
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
              <MonoButton label="BACK" variant="secondary" onPress={() => router.back()} />
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
  copy: {
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
