import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceChip } from "../../../components/ChoiceChip";
import { MonoButton } from "../../../components/MonoButton";
import { MonoInput } from "../../../components/MonoInput";
import { Panel } from "../../../components/Panel";
import { SectionHeading } from "../../../components/SectionHeading";
import { StatusPill } from "../../../components/StatusPill";
import { formatDate, getProductImageSource, getProductStock } from "../shared";
import { ProductDetailViewModel } from "../view-models";
import { useResolvedTheme } from "../../../lib/theme";

export function ProductDetailExperience({
  language,
  copy,
  product,
  activeMediaUrl,
  activeMediaIndex,
  deliveryOptions,
  selectedDate,
  selectedVariant,
  selectedTryOnId,
  photoUrl,
  submittingTryOn,
  productTryOns,
  styleLabels,
  onSelectMedia,
  onSelectVariant,
  onSelectDate,
  onSelectTryOn,
  onPhotoUrlChange,
  onCreateTryOn,
  onAddToCart,
  onContinue,
  onOpenCart,
  onBack,
}: ProductDetailViewModel) {
  const theme = useResolvedTheme();
  const visualSource = activeMediaUrl ? { uri: activeMediaUrl } : getProductImageSource(product);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        <Panel style={styles.visualPanel}>
          <View style={[styles.visualBlock, { borderColor: theme.colors.borderSoft }]}>
            <Image source={visualSource} style={styles.visualImage} resizeMode="cover" />
            <View style={styles.visualTop}>
              <Text style={[styles.visualMeta, { color: theme.colors.textMuted }]}>
                {copy.sku} / {product.sku}
              </Text>
              <Text style={[styles.visualMeta, { color: theme.colors.textPrimary }]}>
                {product.formattedPrice}
              </Text>
            </View>
            <View style={styles.visualBottom}>
              <Text style={[styles.visualTitle, { color: theme.colors.textPrimary }]}>
                {product.subtitle}
              </Text>
            </View>
          </View>

          <View style={styles.thumbnailRow}>
            {product.media.map((media, index) => (
              <ChoiceChip
                key={media.id}
                label={`${copy.gallery} ${index + 1}`}
                active={activeMediaIndex === index}
                onPress={() => onSelectMedia(index)}
              />
            ))}
          </View>
        </Panel>

        <Panel style={styles.detailsPanel}>
          <SectionHeading title={product.name.toUpperCase()} subtitle={product.description} />
          <Text style={[styles.price, { color: theme.colors.textPrimary }]}>{product.formattedPrice}</Text>

          <View style={styles.tagRow}>
            {styleLabels.map((style) => (
              <StatusPill key={style} label={style} tone="ghost" />
            ))}
          </View>

          <View style={styles.metaRows}>
            {[
              [copy.category, product.categoryName],
              [copy.composition, product.composition],
              [copy.fitNotes, product.fittingNotes],
              [copy.delivery, product.deliveryEstimate],
              [copy.style, `${getProductStock(product)} / ${product.variants.length}`],
            ].map(([label, value]) => (
              <View key={label} style={[styles.metaRow, { borderColor: theme.colors.borderSoft }]}>
                <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{label}</Text>
                <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.selectionBlock}>
            <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.sizeSelection}</Text>
            <View style={styles.chipRow}>
              {product.variants.map((variant) => (
                <ChoiceChip
                  key={variant.id}
                  label={`${variant.sizeLabel} / ${Math.max(variant.stock - variant.reserved, 0)}`}
                  active={selectedVariant?.id === variant.id}
                  onPress={() => onSelectVariant(variant.id)}
                />
              ))}
            </View>
          </View>

          {product.availability === "preorder" ? (
            <View style={styles.selectionBlock}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.selectDelivery}</Text>
              <View style={styles.chipRow}>
                {deliveryOptions.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    active={selectedDate === option}
                    onPress={() => onSelectDate(option)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <Panel style={styles.tryOnPanel}>
            <SectionHeading title={copy.tryOnTitle} subtitle={copy.tryOnSubtitle} compact />
            <MonoInput
              label={copy.sourceImage}
              value={photoUrl}
              onChangeText={onPhotoUrlChange}
              placeholder={copy.sourceImagePlaceholder}
              autoCapitalize="none"
            />
            <MonoButton
              label={submittingTryOn ? copy.generating : copy.generate}
              variant="secondary"
              onPress={() => {
                void onCreateTryOn();
              }}
            />

            <View style={styles.tryOnHistory}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.tryOnHistory}</Text>
              <View style={styles.chipRow}>
                {productTryOns.map((session) => (
                  <ChoiceChip
                    key={session.id}
                    label={formatDate(session.createdAt, language)}
                    active={selectedTryOnId === session.id}
                    onPress={() => onSelectTryOn(session.id)}
                  />
                ))}
              </View>
            </View>
          </Panel>

          <StatusPill
            label={product.availability === "in_stock" ? copy.ready : copy.preorder}
            tone={product.availability === "in_stock" ? "solid" : "ghost"}
          />

          <View style={styles.actionRow}>
            <MonoButton label={copy.addToCart} variant="secondary" onPress={onAddToCart} />
            <MonoButton label={copy.continue} onPress={onContinue} />
            <MonoButton label={copy.cart} variant="secondary" onPress={onOpenCart} />
            <MonoButton label={copy.back} variant="secondary" onPress={onBack} />
          </View>
        </Panel>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  visualPanel: {
    flex: 1,
    minWidth: 320,
    gap: 18,
  },
  visualBlock: {
    minHeight: 700,
    borderWidth: 1,
    borderRadius: 30,
    overflow: "hidden",
  },
  visualImage: {
    width: "100%",
    height: "100%",
  },
  visualTop: {
    position: "absolute",
    top: 20,
    left: 22,
    right: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  visualBottom: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 22,
  },
  visualMeta: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.6,
  },
  visualTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: 0.8,
    maxWidth: 420,
  },
  thumbnailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  detailsPanel: {
    flex: 1,
    minWidth: 320,
    gap: 18,
  },
  price: {
    fontFamily: "Oswald_500Medium",
    fontSize: 44,
    letterSpacing: 1.2,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaRows: {
    gap: 14,
  },
  metaRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  metaLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  metaValue: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 23,
  },
  selectionBlock: {
    gap: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tryOnPanel: {
    gap: 12,
  },
  tryOnHistory: {
    gap: 10,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
