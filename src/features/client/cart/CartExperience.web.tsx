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
      <View style={styles.grid}>
        <Panel style={styles.listPanel}>
          <SectionHeading title={copy.cartTitle} subtitle={copy.cartSubtitle} compact />

          <View style={styles.itemList}>
            {cartLines.map((entry) => (
              <View
                key={entry.id}
                style={[
                  styles.itemCard,
                  {
                    borderColor: theme.colors.borderSoft,
                    backgroundColor: theme.colors.surfaceSecondary,
                  },
                ]}
              >
                <Image
                  source={getProductImageSource(entry.product)}
                  style={styles.itemImage}
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
                        onPress={() => onUpdateQuantity(entry.id, entry.quantity - 1)}
                      />
                      <Text style={[styles.quantityValue, { color: theme.colors.textPrimary }]}>
                        {entry.quantity}
                      </Text>
                      <ChoiceChip
                        label={copy.plus}
                        active={false}
                        onPress={() => onUpdateQuantity(entry.id, entry.quantity + 1)}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.itemActions}>
                  <Text style={[styles.totalValue, { color: theme.colors.textPrimary }]}>
                    {formatPrice(entry.total, language)}
                  </Text>
                  <MonoButton label={copy.remove} variant="secondary" onPress={() => onRemoveItem(entry.id)} />
                </View>
              </View>
            ))}
          </View>

          <MonoButton label={copy.clear} variant="secondary" onPress={onClearCart} />
        </Panel>

        <Panel style={styles.checkoutPanel}>
          <StatusPill label={`${copy.total} / ${formatPrice(totalAmount, language)}`} tone="solid" />

          <View style={styles.selectionBlock}>
            <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>{copy.payment}</Text>
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
            <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>{copy.delivery}</Text>
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

          <View style={styles.actionRow}>
            <MonoButton
              label={isSubmitting ? copy.checkingOut : copy.checkout}
              onPress={() => {
                void onCheckout();
              }}
            />
            <MonoButton label={copy.openProfile} variant="secondary" onPress={onOpenProfile} />
          </View>
        </Panel>
      </View>
    </ScrollView>
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
  listPanel: {
    flex: 1.08,
    minWidth: 360,
    gap: 16,
  },
  itemList: {
    gap: 12,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 14,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  itemImage: {
    width: 132,
    height: 164,
    borderRadius: 18,
  },
  itemCopy: {
    flex: 1,
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
    letterSpacing: 1,
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
    minWidth: 340,
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
