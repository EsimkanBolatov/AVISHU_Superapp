import { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceChip } from "../../src/components/ChoiceChip";
import { MonoButton } from "../../src/components/MonoButton";
import { MonoInput } from "../../src/components/MonoInput";
import { Panel } from "../../src/components/Panel";
import { ScreenShell } from "../../src/components/ScreenShell";
import { SectionHeading } from "../../src/components/SectionHeading";
import { StatusPill } from "../../src/components/StatusPill";
import { useResolvedTheme } from "../../src/lib/theme";
import { useRequireRole } from "../../src/lib/useRequireRole";
import { useAppStore } from "../../src/store/useAppStore";
import { AppLanguage, ContentEntryUpsertPayload, ProductAvailability, ProductUpsertPayload } from "../../src/types";

type AdminTab = "catalog" | "orders" | "content";

const EMPTY_PRODUCT_FORM: ProductUpsertPayload = {
  name: "",
  subtitle: "",
  categoryId: "",
  priceAmount: 0,
  availability: "in_stock",
  description: "",
  composition: "",
  fittingNotes: "",
  deliveryEstimate: "",
  featured: false,
  coverUrl: "",
  galleryUrls: [],
  sizeLabels: ["S", "M", "L"],
  style: ["technical"],
  defaultStock: 3,
  brandName: "AVISHU",
  collectionName: "Core",
  dropName: "Drop 01",
  seasonLabel: "SS26",
  limitedEdition: false,
  limitedQuantity: undefined,
  colors: ["Black"],
  materials: ["Technical fabric"],
  fitProfile: "Relaxed",
  careInstructions: "Dry clean or delicate cold wash depending on fabrication.",
  sizeGuide: "Choose your usual size.",
  editorialStory: "Editorial story coming soon.",
  relatedProductIds: [],
  crossSellProductIds: [],
};

const EMPTY_CONTENT_FORM: ContentEntryUpsertPayload = {
  kind: "journal",
  slug: "",
  locale: "ru",
  title: "",
  summary: "",
  body: "",
  coverUrl: "",
  eyebrow: "",
  featured: false,
};

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    shellSubtitle: string;
    webOnly: string;
    catalog: string;
    orders: string;
    content: string;
    create: string;
    update: string;
    reset: string;
    remove: string;
    saveContent: string;
    metricsTitle: string;
    metricsSubtitle: string;
    catalogTitle: string;
    catalogSubtitle: string;
    contentTitle: string;
    contentSubtitle: string;
    ordersTitle: string;
    ordersSubtitle: string;
  }
> = {
  ru: {
    shellTitle: "Admin",
    shellSubtitle: "CATALOG / CONTENT / ORDER VISIBILITY",
    webOnly: "Эта панель доступна только в web-версии.",
    catalog: "Каталог",
    orders: "Заказы",
    content: "Контент",
    create: "Создать",
    update: "Обновить",
    reset: "Сброс",
    remove: "Удалить",
    saveContent: "Сохранить контент",
    metricsTitle: "Коммерческий слой",
    metricsSubtitle: "Admin управляет каталогом, контентом и видимостью воронки.",
    catalogTitle: "Редактор каталога",
    catalogSubtitle: "Product cards, metadata, premium facets и merchandising.",
    contentTitle: "CMS content",
    contentSubtitle: "Журнал, lookbook, campaign и collection story для ru / kk / en.",
    ordersTitle: "Order visibility",
    ordersSubtitle: "Read-only visibility по заказам и воронке.",
  },
  kk: {
    shellTitle: "Admin",
    shellSubtitle: "CATALOG / CONTENT / ORDER VISIBILITY",
    webOnly: "Бұл панель тек web-нұсқада қолжетімді.",
    catalog: "Каталог",
    orders: "Тапсырыстар",
    content: "Контент",
    create: "Құру",
    update: "Жаңарту",
    reset: "Тастау",
    remove: "Жою",
    saveContent: "Контентті сақтау",
    metricsTitle: "Коммерциялық қабат",
    metricsSubtitle: "Admin каталогты, контентті және funnel visibility-ді басқарады.",
    catalogTitle: "Каталог редакторы",
    catalogSubtitle: "Product cards, metadata, premium facets және merchandising.",
    contentTitle: "CMS content",
    contentSubtitle: "ru / kk / en үшін journal, lookbook, campaign және collection story.",
    ordersTitle: "Order visibility",
    ordersSubtitle: "Тапсырыстар мен funnel бойынша read-only көрініс.",
  },
  en: {
    shellTitle: "Admin",
    shellSubtitle: "CATALOG / CONTENT / ORDER VISIBILITY",
    webOnly: "This panel is available only in the web experience.",
    catalog: "Catalog",
    orders: "Orders",
    content: "Content",
    create: "Create",
    update: "Update",
    reset: "Reset",
    remove: "Delete",
    saveContent: "Save content",
    metricsTitle: "Commerce layer",
    metricsSubtitle: "Admin owns catalog, content and funnel visibility.",
    catalogTitle: "Catalog editor",
    catalogSubtitle: "Product cards, metadata, premium facets and merchandising.",
    contentTitle: "CMS content",
    contentSubtitle: "Journal, lookbook, campaign and collection story across ru / kk / en.",
    ordersTitle: "Order visibility",
    ordersSubtitle: "Read-only visibility into orders and funnel metrics.",
  },
};

export default function AdminScreen() {
  const redirect = useRequireRole("admin");
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const products = useAppStore((state) => state.products);
  const categories = useAppStore((state) => state.categories);
  const orders = useAppStore((state) => state.orders);
  const metrics = useAppStore((state) => state.metrics);
  const funnel = useAppStore((state) => state.funnel);
  const contentEntries = useAppStore((state) => state.contentEntries);
  const createProduct = useAppStore((state) => state.createProduct);
  const updateProduct = useAppStore((state) => state.updateProduct);
  const deleteProduct = useAppStore((state) => state.deleteProduct);
  const createContent = useAppStore((state) => state.createContent);
  const updateContent = useAppStore((state) => state.updateContent);
  const deleteContent = useAppStore((state) => state.deleteContent);
  const copy = COPY[language];

  const [tab, setTab] = useState<AdminTab>("catalog");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductUpsertPayload>(EMPTY_PRODUCT_FORM);
  const [contentForm, setContentForm] = useState<ContentEntryUpsertPayload>(EMPTY_CONTENT_FORM);

  const featuredProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? products[0] ?? null,
    [products, selectedProductId],
  );

  if (redirect) {
    return redirect;
  }

  if (Platform.OS !== "web") {
    return (
      <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle} profileRoute="/profile">
        <Panel>
          <SectionHeading title={copy.shellTitle} subtitle={copy.webOnly} compact />
        </Panel>
      </ScreenShell>
    );
  }

  function hydrateProduct(productId: string) {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    setSelectedProductId(product.id);
    setProductForm({
      name: product.name,
      subtitle: product.subtitle,
      categoryId: product.categoryId,
      priceAmount: product.priceAmount,
      availability: product.availability,
      description: product.description,
      composition: product.composition,
      fittingNotes: product.fittingNotes,
      deliveryEstimate: product.deliveryEstimate,
      featured: product.featured,
      coverUrl: product.media[0]?.url ?? "",
      galleryUrls: product.media.slice(1).map((item) => item.url),
      sizeLabels: product.variants.map((item) => item.sizeLabel),
      style: product.style,
      defaultStock: product.variants[0]?.stock ?? 3,
      brandName: product.brandName,
      collectionName: product.collectionName,
      dropName: product.dropName,
      seasonLabel: product.seasonLabel,
      limitedEdition: product.limitedEdition,
      limitedQuantity: product.limitedQuantity,
      colors: product.colors,
      materials: product.materials,
      fitProfile: product.fitProfile,
      careInstructions: product.careInstructions,
      sizeGuide: product.sizeGuide,
      editorialStory: product.editorialStory,
      relatedProductIds: product.relatedProductIds,
      crossSellProductIds: product.crossSellProductIds,
    });
  }

  function hydrateContent(contentId: string) {
    const entry = contentEntries.find((item) => item.id === contentId);

    if (!entry) {
      return;
    }

    setSelectedContentId(entry.id);
    setContentForm({
      kind: entry.kind,
      slug: entry.slug,
      locale: entry.locale,
      title: entry.title,
      summary: entry.summary,
      body: entry.body,
      coverUrl: entry.coverUrl,
      eyebrow: entry.eyebrow,
      featured: entry.featured,
    });
  }

  function resetProductForm() {
    setSelectedProductId(null);
    setProductForm(EMPTY_PRODUCT_FORM);
  }

  function resetContentForm() {
    setSelectedContentId(null);
    setContentForm(EMPTY_CONTENT_FORM);
  }

  return (
    <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle} profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.leadPanel}>
          <StatusPill label="ADMIN CONTROL / MERCHANDISING SURFACE" tone="solid" />
          <Text style={[styles.leadTitle, { color: theme.colors.textPrimary }]}>{copy.metricsTitle}</Text>
          <Text style={[styles.leadSubtitle, { color: theme.colors.textSecondary }]}>{copy.metricsSubtitle}</Text>
          <View style={styles.tabRow}>
            {([
              ["catalog", copy.catalog],
              ["orders", copy.orders],
              ["content", copy.content],
            ] as const).map(([value, label]) => (
              <ChoiceChip key={value} label={label} active={tab === value} onPress={() => setTab(value)} />
            ))}
          </View>

          <View style={styles.metricGrid}>
            {[
              ["Revenue", metrics.revenue],
              ["Products", String(metrics.products)],
              ["Favorites", String(metrics.favoriteCount)],
              ["Content", String(metrics.contentEntries)],
              ["Views", String(funnel.productViews)],
              ["Paid", String(funnel.paidOrders)],
            ].map(([label, value]) => (
              <View key={label} style={[styles.metricCard, { borderColor: theme.colors.borderSoft }]}>
                <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>{label}</Text>
                <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>{value}</Text>
              </View>
            ))}
          </View>
        </Panel>

        {tab === "catalog" ? (
          <View style={styles.grid}>
            <Panel style={styles.sidePanel}>
              <SectionHeading title={copy.catalogTitle} subtitle={copy.catalogSubtitle} compact />
              <View style={styles.stack}>
                {products.map((product) => (
                  <View key={product.id} style={[styles.entityCard, { borderColor: theme.colors.borderSoft }]}>
                    <Text style={[styles.entityTitle, { color: theme.colors.textPrimary }]}>{product.name}</Text>
                    <Text style={[styles.entityBody, { color: theme.colors.textSecondary }]}>
                      {product.categoryName} / {product.formattedPrice} / {product.collectionName}
                    </Text>
                    <MonoButton label={copy.update} variant="secondary" onPress={() => hydrateProduct(product.id)} />
                  </View>
                ))}
              </View>
            </Panel>

            <Panel style={styles.editorPanel}>
              <SectionHeading title={selectedProductId ? copy.update : copy.create} subtitle={copy.catalogSubtitle} compact />
              <View style={styles.formGrid}>
                <MonoInput label="Name" value={productForm.name} onChangeText={(value) => setProductForm((current) => ({ ...current, name: value }))} />
                <MonoInput label="Subtitle" value={productForm.subtitle} onChangeText={(value) => setProductForm((current) => ({ ...current, subtitle: value }))} />
                <MonoInput label="Category ID" value={productForm.categoryId} onChangeText={(value) => setProductForm((current) => ({ ...current, categoryId: value }))} placeholder={categories[0]?.id ?? "c-outerwear"} />
                <MonoInput label="Price" value={String(productForm.priceAmount || "")} onChangeText={(value) => setProductForm((current) => ({ ...current, priceAmount: Number(value || 0) }))} keyboardType="numeric" />
                <MonoInput label="Cover URL" value={productForm.coverUrl} onChangeText={(value) => setProductForm((current) => ({ ...current, coverUrl: value }))} />
                <MonoInput label="Gallery URLs" value={productForm.galleryUrls.join(", ")} onChangeText={(value) => setProductForm((current) => ({ ...current, galleryUrls: value.split(",").map((item) => item.trim()).filter(Boolean) }))} />
                <MonoInput label="Sizes" value={productForm.sizeLabels.join(", ")} onChangeText={(value) => setProductForm((current) => ({ ...current, sizeLabels: value.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean) }))} />
                <MonoInput label="Style tags" value={productForm.style.join(", ")} onChangeText={(value) => setProductForm((current) => ({ ...current, style: value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean) }))} />
                <MonoInput label="Brand" value={productForm.brandName} onChangeText={(value) => setProductForm((current) => ({ ...current, brandName: value }))} />
                <MonoInput label="Collection" value={productForm.collectionName} onChangeText={(value) => setProductForm((current) => ({ ...current, collectionName: value }))} />
                <MonoInput label="Drop" value={productForm.dropName} onChangeText={(value) => setProductForm((current) => ({ ...current, dropName: value }))} />
                <MonoInput label="Season" value={productForm.seasonLabel} onChangeText={(value) => setProductForm((current) => ({ ...current, seasonLabel: value }))} />
                <MonoInput label="Colors" value={productForm.colors.join(", ")} onChangeText={(value) => setProductForm((current) => ({ ...current, colors: value.split(",").map((item) => item.trim()).filter(Boolean) }))} />
                <MonoInput label="Materials" value={productForm.materials.join(", ")} onChangeText={(value) => setProductForm((current) => ({ ...current, materials: value.split(",").map((item) => item.trim()).filter(Boolean) }))} />
                <MonoInput label="Fit" value={productForm.fitProfile} onChangeText={(value) => setProductForm((current) => ({ ...current, fitProfile: value }))} />
              </View>

              <MonoInput label="Description" value={productForm.description} onChangeText={(value) => setProductForm((current) => ({ ...current, description: value }))} multiline />
              <MonoInput label="Composition" value={productForm.composition} onChangeText={(value) => setProductForm((current) => ({ ...current, composition: value }))} multiline />
              <MonoInput label="Fitting notes" value={productForm.fittingNotes} onChangeText={(value) => setProductForm((current) => ({ ...current, fittingNotes: value }))} multiline />
              <MonoInput label="Delivery estimate" value={productForm.deliveryEstimate} onChangeText={(value) => setProductForm((current) => ({ ...current, deliveryEstimate: value }))} />
              <MonoInput label="Care instructions" value={productForm.careInstructions} onChangeText={(value) => setProductForm((current) => ({ ...current, careInstructions: value }))} multiline />
              <MonoInput label="Size guide" value={productForm.sizeGuide} onChangeText={(value) => setProductForm((current) => ({ ...current, sizeGuide: value }))} multiline />
              <MonoInput label="Editorial story" value={productForm.editorialStory} onChangeText={(value) => setProductForm((current) => ({ ...current, editorialStory: value }))} multiline />

              <View style={styles.choiceRow}>
                {(["in_stock", "preorder"] as ProductAvailability[]).map((item) => (
                  <ChoiceChip key={item} label={item.toUpperCase()} active={productForm.availability === item} onPress={() => setProductForm((current) => ({ ...current, availability: item }))} />
                ))}
                <ChoiceChip label="FEATURED" active={productForm.featured} onPress={() => setProductForm((current) => ({ ...current, featured: !current.featured }))} />
                <ChoiceChip label="LIMITED" active={productForm.limitedEdition} onPress={() => setProductForm((current) => ({ ...current, limitedEdition: !current.limitedEdition }))} />
              </View>

              <View style={styles.row}>
                <MonoButton
                  label={selectedProductId ? copy.update : copy.create}
                  onPress={async () => {
                    if (selectedProductId) {
                      await updateProduct(selectedProductId, productForm);
                    } else {
                      await createProduct(productForm);
                    }
                    resetProductForm();
                  }}
                />
                <MonoButton label={copy.reset} variant="secondary" onPress={resetProductForm} />
                {selectedProductId ? (
                  <MonoButton label={copy.remove} variant="secondary" onPress={async () => {
                    await deleteProduct(selectedProductId);
                    resetProductForm();
                  }} />
                ) : null}
              </View>

              {featuredProduct ? (
                <View style={[styles.previewCard, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.entityTitle, { color: theme.colors.textPrimary }]}>{featuredProduct.name}</Text>
                  <Text style={[styles.entityBody, { color: theme.colors.textSecondary }]}>{featuredProduct.editorialStory}</Text>
                </View>
              ) : null}
            </Panel>
          </View>
        ) : null}

        {tab === "orders" ? (
          <Panel style={styles.editorPanel}>
            <SectionHeading title={copy.ordersTitle} subtitle={copy.ordersSubtitle} compact />
            <View style={styles.stack}>
              {orders.map((order) => (
                <View key={order.id} style={[styles.entityCard, { borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.entityTitle, { color: theme.colors.textPrimary }]}>{order.number}</Text>
                  <Text style={[styles.entityBody, { color: theme.colors.textSecondary }]}>
                    {order.customerName} / {order.productName} / {order.status.toUpperCase()}
                  </Text>
                  <Text style={[styles.entityBody, { color: theme.colors.textSecondary }]}>
                    {order.priority.toUpperCase()} / SLA {order.slaHours}h / {order.totalFormatted}
                  </Text>
                </View>
              ))}
            </View>
          </Panel>
        ) : null}

        {tab === "content" ? (
          <View style={styles.grid}>
            <Panel style={styles.sidePanel}>
              <SectionHeading title={copy.contentTitle} subtitle={copy.contentSubtitle} compact />
              <View style={styles.stack}>
                {contentEntries.map((entry) => (
                  <View key={entry.id} style={[styles.entityCard, { borderColor: theme.colors.borderSoft }]}>
                    <Text style={[styles.entityTitle, { color: theme.colors.textPrimary }]}>{entry.title}</Text>
                    <Text style={[styles.entityBody, { color: theme.colors.textSecondary }]}>
                      {entry.kind} / {entry.locale} / {entry.slug}
                    </Text>
                    <MonoButton label={copy.update} variant="secondary" onPress={() => hydrateContent(entry.id)} />
                  </View>
                ))}
              </View>
            </Panel>

            <Panel style={styles.editorPanel}>
              <SectionHeading title={copy.contentTitle} subtitle={copy.contentSubtitle} compact />
              <View style={styles.choiceRow}>
                {(["journal", "lookbook", "campaign", "collection_story"] as const).map((kind) => (
                  <ChoiceChip key={kind} label={kind.toUpperCase()} active={contentForm.kind === kind} onPress={() => setContentForm((current) => ({ ...current, kind }))} />
                ))}
              </View>
              <View style={styles.choiceRow}>
                {(["ru", "kk", "en"] as const).map((locale) => (
                  <ChoiceChip key={locale} label={locale.toUpperCase()} active={contentForm.locale === locale} onPress={() => setContentForm((current) => ({ ...current, locale }))} />
                ))}
                <ChoiceChip label="FEATURED" active={contentForm.featured} onPress={() => setContentForm((current) => ({ ...current, featured: !current.featured }))} />
              </View>
              <MonoInput label="Slug" value={contentForm.slug} onChangeText={(value) => setContentForm((current) => ({ ...current, slug: value }))} />
              <MonoInput label="Eyebrow" value={contentForm.eyebrow} onChangeText={(value) => setContentForm((current) => ({ ...current, eyebrow: value }))} />
              <MonoInput label="Title" value={contentForm.title} onChangeText={(value) => setContentForm((current) => ({ ...current, title: value }))} />
              <MonoInput label="Summary" value={contentForm.summary} onChangeText={(value) => setContentForm((current) => ({ ...current, summary: value }))} multiline />
              <MonoInput label="Body" value={contentForm.body} onChangeText={(value) => setContentForm((current) => ({ ...current, body: value }))} multiline />
              <MonoInput label="Cover URL" value={contentForm.coverUrl} onChangeText={(value) => setContentForm((current) => ({ ...current, coverUrl: value }))} />
              <View style={styles.row}>
                <MonoButton
                  label={selectedContentId ? copy.update : copy.saveContent}
                  onPress={async () => {
                    if (selectedContentId) {
                      await updateContent(selectedContentId, contentForm);
                    } else {
                      await createContent(contentForm);
                    }
                    resetContentForm();
                  }}
                />
                <MonoButton label={copy.reset} variant="secondary" onPress={resetContentForm} />
                {selectedContentId ? (
                  <MonoButton label={copy.remove} variant="secondary" onPress={async () => {
                    await deleteContent(selectedContentId);
                    resetContentForm();
                  }} />
                ) : null}
              </View>
            </Panel>
          </View>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 24,
  },
  leadPanel: {
    gap: 14,
  },
  leadTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: 0.8,
  },
  leadSubtitle: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 860,
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    minWidth: 160,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    gap: 6,
  },
  metricLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  metricValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 28,
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "flex-start",
  },
  sidePanel: {
    flex: 0.8,
    minWidth: 320,
    gap: 14,
  },
  editorPanel: {
    flex: 1.2,
    minWidth: 360,
    gap: 14,
  },
  stack: {
    gap: 12,
  },
  entityCard: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 8,
  },
  entityTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    letterSpacing: 0.7,
  },
  entityBody: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  formGrid: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  previewCard: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
});
