import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceChip } from "../../../components/ChoiceChip";
import { MonoButton } from "../../../components/MonoButton";
import { MonoInput } from "../../../components/MonoInput";
import { Panel } from "../../../components/Panel";
import { SectionHeading } from "../../../components/SectionHeading";
import { StatusPill } from "../../../components/StatusPill";
import { formatDate, getProductImageSource } from "../shared";
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
      <View style={[styles.visualPanel, { borderColor: theme.colors.borderSoft }]}>
        <Image source={visualSource} style={styles.visualImage} resizeMode="cover" />
        <View style={styles.visualMeta}>
          <Text style={[styles.visualCode, { color: theme.colors.textMuted }]}>
            {copy.sku} / {product.sku}
          </Text>
          <Text style={[styles.visualPrice, { color: theme.colors.textPrimary }]}>{product.formattedPrice}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRail}>
        {product.media.map((media, index) => (
          <ChoiceChip
            key={media.id}
            label={`${copy.gallery} ${index + 1}`}
            active={activeMediaIndex === index}
            onPress={() => onSelectMedia(index)}
          />
        ))}
      </ScrollView>

      <Panel style={styles.contentPanel}>
        <SectionHeading title={product.name.toUpperCase()} subtitle={product.description} compact />
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
          ].map(([label, value]) => (
            <View key={label} style={[styles.metaRow, { borderColor: theme.colors.borderSoft }]}>
              <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{label}</Text>
              <Text style={[styles.metaValue, { color: theme.colors.textSecondary }]}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.selectionBlock}>
          <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.sizeSelection}</Text>
          <View style={styles.chipWrap}>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRail}>
              {deliveryOptions.map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  active={selectedDate === option}
                  onPress={() => onSelectDate(option)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </Panel>

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
        <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{copy.tryOnHistory}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRail}>
          {productTryOns.map((session) => (
            <ChoiceChip
              key={session.id}
              label={formatDate(session.createdAt, language)}
              active={selectedTryOnId === session.id}
              onPress={() => onSelectTryOn(session.id)}
            />
          ))}
        </ScrollView>
      </Panel>

      <Panel style={styles.actionPanel}>
        <StatusPill
          label={product.availability === "in_stock" ? copy.ready : copy.preorder}
          tone={product.availability === "in_stock" ? "solid" : "ghost"}
        />
        <View style={styles.actionStack}>
          <MonoButton label={copy.continue} onPress={onContinue} />
          <MonoButton label={copy.addToCart} variant="secondary" onPress={onAddToCart} />
          <MonoButton label={copy.cart} variant="secondary" onPress={onOpenCart} />
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
  visualPanel: {
    width: "100%",           // Задаем ширину
    aspectRatio: 3 / 4,      // Пропорция, чтобы фото не улетало в бесконечность
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  visualImage: {
    width: "100%",
    height: "100%",
  },
  visualMeta: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    gap: 4,
  },
  visualCode: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  visualPrice: {
    fontFamily: "Oswald_500Medium",
    fontSize: 34,
    letterSpacing: 1,
  },
  galleryRail: {
    gap: 10,
    paddingRight: 8,
  },
  contentPanel: {
    gap: 14,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaRows: {
    gap: 12,
  },
  metaRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 6,
  },
  metaLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  metaValue: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  selectionBlock: {
    gap: 8,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tryOnPanel: {
    gap: 12,
  },
  actionPanel: {
    gap: 14,
  },
  actionStack: {
    gap: 10,
  },
});