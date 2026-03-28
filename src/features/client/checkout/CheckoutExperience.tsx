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
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.confirmationPanel}>
          <StatusPill label="ORDER LOCKED / LIVE SYNC" tone="solid" />
          <Image
            source={existingOrder.productMediaUrl ? { uri: existingOrder.productMediaUrl } : getProductImageSource()}
            style={styles.confirmationImage}
            resizeMode="cover"
          />
          <SectionHeading title={copy.confirmedTitle} subtitle={copy.confirmedSubtitle} compact />
          <Text style={[styles.orderCode, { color: theme.colors.textPrimary }]}>{existingOrder.number}</Text>
          <View style={styles.infoRows}>
            {confirmationFields.map((field) => (
              <View key={field.label} style={[styles.infoRow, { borderColor: theme.colors.borderSoft }]}>
                <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>{field.label}</Text>
                <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>{field.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.actionStack}>
            <MonoButton label={copy.openProfile} onPress={onOpenProfile} />
            <MonoButton label={copy.backToClient} variant="secondary" onPress={onBackToClient} />
          </View>
        </Panel>
      </ScrollView>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.visualPanel, { borderColor: theme.colors.borderSoft }]}>
        <Image source={getProductImageSource(product)} style={styles.visualImage} resizeMode="cover" />
        <View style={styles.visualMetaWrap}>
          <StatusPill label={`${product.categoryName.toUpperCase()} / ${product.sku}`} tone="ghost" />
          <Text style={[styles.visualHeadline, { color: theme.colors.textPrimary }]}>{product.formattedPrice}</Text>
        </View>
      </View>

      <Panel style={styles.formPanel}>
        <SectionHeading title={copy.realCheckout} subtitle={copy.realCheckoutSubtitle} compact />
        <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>{product.name}</Text>
        <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
          {copy.size} {selectedVariant?.sizeLabel ?? "N/A"} / {product.formattedPrice}
        </Text>

        <View style={styles.selectionBlock}>
          <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>{copy.paymentMethod}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRail}>
            {PAYMENT_METHODS.map((item) => (
              <ChoiceChip
                key={item}
                label={item.toUpperCase()}
                active={paymentMethod === item}
                onPress={() => onSetPaymentMethod(item)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.selectionBlock}>
          <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>{copy.deliveryMethod}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRail}>
            {DELIVERY_METHODS.map((item) => (
              <ChoiceChip
                key={item}
                label={item.toUpperCase()}
                active={deliveryMethod === item}
                onPress={() => onSetDeliveryMethod(item)}
              />
            ))}
          </ScrollView>
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

        <View style={styles.actionStack}>
          <MonoButton
            label={isSubmitting ? copy.placing : copy.confirm}
            onPress={() => {
              void onConfirm();
            }}
          />
          <MonoButton label={copy.back} variant="secondary" onPress={onBack} />
        </View>
      </Panel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 24,
  },
  confirmationPanel: {
    gap: 14,
  },
  confirmationImage: {
    width: "100%",
    height: 260,
    borderRadius: 18,
  },
  orderCode: {
    fontFamily: "Oswald_500Medium",
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: 1.2,
  },
  visualPanel: {
    minHeight: 280,
    borderWidth: 1,
    borderRadius: 24,
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
    gap: 10,
  },
  visualHeadline: {
    fontFamily: "Oswald_500Medium",
    fontSize: 34,
    letterSpacing: 1,
  },
  formPanel: {
    gap: 14,
  },
  summaryTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 28,
    lineHeight: 30,
  },
  summaryText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  selectionBlock: {
    gap: 8,
  },
  selectionLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  choiceRail: {
    gap: 10,
    paddingRight: 8,
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
    lineHeight: 20,
  },
  actionStack: {
    gap: 10,
  },
});
