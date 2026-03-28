import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceChip } from "../../../components/ChoiceChip";
import { MonoButton } from "../../../components/MonoButton";
import { MonoInput } from "../../../components/MonoInput";
import { Panel } from "../../../components/Panel";
import { SectionHeading } from "../../../components/SectionHeading";
import { StatusPill } from "../../../components/StatusPill";
import { getProductImageSource } from "../shared";
import { CheckoutViewModel } from "../view-models";
import { useResolvedTheme } from "../../../lib/theme";

const PAYMENT_METHODS = ["card", "kaspi", "transfer"];
const DELIVERY_METHODS = ["pickup", "courier"];

export function CheckoutExperience({
  copy,
  existingOrder,
  product,
  selectedVariant,
  paymentMethod,
  deliveryMethod,
  shippingAddress,
  contactPhone,
  notes,
  isSubmitting,
  scheduledDate,
  tryOnId,
  confirmationFields,
  onSetPaymentMethod,
  onSetDeliveryMethod,
  onSetShippingAddress,
  onSetContactPhone,
  onSetNotes,
  onConfirm,
  onBack,
  onOpenProfile,
  onBackToClient,
}: CheckoutViewModel) {
  const theme = useResolvedTheme();

  if (existingOrder) {
    return (
      <View style={styles.container}>
        <Panel style={styles.panel}>
          <View style={styles.header}>
            <StatusPill label="ORDER LOCKED / LIVE SYNC" tone="solid" />
            <Text style={[styles.headerMeta, { color: theme.colors.textMuted }]}>{copy.headerMeta}</Text>
          </View>

          <View style={styles.grid}>
            <View style={[styles.checkoutVisual, { borderColor: theme.colors.borderSoft }]}>
              <Image
                source={existingOrder.productMediaUrl ? { uri: existingOrder.productMediaUrl } : getProductImageSource()}
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
                {confirmationFields.map((field) => (
                  <View key={field.label} style={[styles.infoRow, { borderColor: theme.colors.borderSoft }]}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>{field.label}</Text>
                    <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>{field.value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actions}>
                <MonoButton label={copy.openProfile} onPress={onOpenProfile} />
                <MonoButton label={copy.backToClient} variant="secondary" onPress={onBackToClient} />
              </View>
            </View>
          </View>
        </Panel>
      </View>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        <Panel style={styles.checkoutVisual}>
          <Image source={getProductImageSource(product)} style={styles.visualImage} resizeMode="cover" />
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
                  onPress={() => onSetPaymentMethod(item)}
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
                  onPress={() => onSetDeliveryMethod(item)}
                />
              ))}
            </View>
          </View>

          <MonoInput
            label={copy.shippingAddress}
            value={shippingAddress}
            onChangeText={onSetShippingAddress}
            multiline
            placeholder={copy.shippingPlaceholder}
          />
          <MonoInput
            label={copy.contactPhone}
            value={contactPhone}
            onChangeText={onSetContactPhone}
            keyboardType="phone-pad"
            placeholder={copy.phonePlaceholder}
          />
          <MonoInput
            label={copy.notes}
            value={notes}
            onChangeText={onSetNotes}
            multiline
            placeholder={copy.notesPlaceholder}
          />

          <View style={styles.infoRows}>
            {scheduledDate ? (
              <View style={[styles.infoRow, { borderColor: theme.colors.borderSoft }]}>
                <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>{copy.preorderDate}</Text>
                <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>{scheduledDate}</Text>
              </View>
            ) : null}
            {tryOnId ? (
              <View style={[styles.infoRow, { borderColor: theme.colors.borderSoft }]}>
                <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>{copy.linkedTryOn}</Text>
                <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>{tryOnId}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.actions}>
            <MonoButton
              label={isSubmitting ? copy.placing : copy.confirm}
              onPress={() => {
                void onConfirm();
              }}
            />
            <MonoButton label={copy.back} variant="secondary" onPress={onBack} />
          </View>
        </Panel>
      </View>
    </ScrollView>
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
    minWidth: 320,
    minHeight: 560,
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
    minWidth: 320,
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
