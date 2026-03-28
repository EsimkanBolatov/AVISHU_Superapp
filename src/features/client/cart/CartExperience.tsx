import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceChip } from "../../../components/ChoiceChip";
import { MonoButton } from "../../../components/MonoButton";
import { MonoInput } from "../../../components/MonoInput";
import { Panel } from "../../../components/Panel";
import { SectionHeading } from "../../../components/SectionHeading";
import { StatusPill } from "../../../components/StatusPill";
import { formatPrice, getProductImageSource } from "../shared";
import { CartViewModel } from "../view-models";
import { useResolvedTheme } from "../../../lib/theme";

const PAYMENT_METHODS = ["card", "kaspi", "transfer"];
const DELIVERY_METHODS = ["pickup", "courier"];

export function CartExperience({
  language,
  copy,
  cartLines,
  paymentMethod,
  deliveryMethod,
  shippingAddress,
  contactPhone,
  notes,
  isSubmitting,
  successMessage,
  totalAmount,
  onSetPaymentMethod,
  onSetDeliveryMethod,
  onSetShippingAddress,
  onSetContactPhone,
  onSetNotes,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onBackToCatalog,
  onOpenProfile,
}: CartViewModel) {
  const theme = useResolvedTheme();

  if (!cartLines.length) {
    return (
      <View style={styles.emptyWrap}>
        <Panel style={styles.emptyPanel}>
          <SectionHeading title={copy.emptyTitle} subtitle={copy.emptySubtitle} />
          <MonoButton label={copy.backToCatalog} onPress={onBackToCatalog} />
        </Panel>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Panel style={styles.summaryPanel}>
        <StatusPill label={`${copy.total} / ${formatPrice(totalAmount, language)}`} tone="solid" />
        <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>{copy.cartTitle}</Text>
        <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{copy.cartSubtitle}</Text>
      </Panel>

      <View style={styles.listBlock}>
        {cartLines.map((entry) => (
          <Panel key={entry.id} style={styles.itemCard}>
            <Image source={getProductImageSource(entry.product)} style={styles.itemImage} resizeMode="cover" />

            <View style={styles.itemCopy}>
              <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>{entry.product.name}</Text>
              <Text style={[styles.itemText, { color: theme.colors.textSecondary }]}>
                {copy.size} / {entry.variant.sizeLabel}
              </Text>
              <Text style={[styles.itemText, { color: theme.colors.textSecondary }]}>
                {entry.product.formattedPrice}
              </Text>
              <Text style={[styles.totalValue, { color: theme.colors.textPrimary }]}>
                {formatPrice(entry.total, language)}
              </Text>
            </View>

            <View style={styles.quantityRow}>
              <ChoiceChip label={copy.minus} active={false} onPress={() => onUpdateQuantity(entry.id, entry.quantity - 1)} />
              <Text style={[styles.quantityValue, { color: theme.colors.textPrimary }]}>{entry.quantity}</Text>
              <ChoiceChip label={copy.plus} active={false} onPress={() => onUpdateQuantity(entry.id, entry.quantity + 1)} />
            </View>

            <MonoButton label={copy.remove} variant="secondary" onPress={() => onRemoveItem(entry.id)} />
          </Panel>
        ))}
      </View>

      <Panel style={styles.checkoutPanel}>
        <View style={styles.selectionBlock}>
          <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>{copy.payment}</Text>
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
          <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>{copy.delivery}</Text>
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
          label={copy.address}
          value={shippingAddress}
          onChangeText={onSetShippingAddress}
          multiline
          placeholder={copy.addressPlaceholder}
        />
        <MonoInput
          label={copy.phone}
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

        {successMessage ? (
          <Text style={[styles.successText, { color: theme.colors.textSecondary }]}>{successMessage}</Text>
        ) : null}

        <View style={styles.actionStack}>
          <MonoButton
            label={isSubmitting ? copy.checkingOut : copy.checkout}
            onPress={() => {
              void onCheckout();
            }}
          />
          <MonoButton label={copy.openProfile} variant="secondary" onPress={onOpenProfile} />
          <MonoButton label={copy.clear} variant="secondary" onPress={onClearCart} />
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
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
  },
  emptyPanel: {
    gap: 16,
  },
  summaryPanel: {
    gap: 10,
  },
  summaryTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: 0.9,
  },
  summaryText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  listBlock: {
    gap: 12,
  },
  itemCard: {
    gap: 12,
  },
  itemImage: {
    width: "100%",
    height: 240,
    borderRadius: 18,
  },
  itemCopy: {
    gap: 6,
  },
  itemTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 26,
    lineHeight: 28,
  },
  itemText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    lineHeight: 20,
  },
  totalValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 28,
    letterSpacing: 0.8,
    paddingTop: 2,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quantityValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    minWidth: 24,
    textAlign: "center",
  },
  checkoutPanel: {
    gap: 14,
  },
  selectionBlock: {
    gap: 8,
  },
  selectionLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  choiceRail: {
    gap: 10,
    paddingRight: 8,
  },
  successText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    lineHeight: 20,
  },
  actionStack: {
    gap: 10,
  },
});
