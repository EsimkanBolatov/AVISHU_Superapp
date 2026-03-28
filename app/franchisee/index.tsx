import { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceChip } from "../../src/components/ChoiceChip";
import { MetricCard } from "../../src/components/MetricCard";
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
import { ProductAvailability, ProductUpsertPayload } from "../../src/types";

type DashboardTab = "overview" | "orders" | "catalog";

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
};

export default function FranchiseeScreen() {
  const redirect = useRequireRole("franchisee");
  const theme = useResolvedTheme();
  const metrics = useAppStore((state) => state.metrics);
  const orders = useAppStore((state) => state.orders);
  const products = useAppStore((state) => state.products);
  const categories = useAppStore((state) => state.categories);
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);
  const addOrderComment = useAppStore((state) => state.addOrderComment);
  const addOrderAttachment = useAppStore((state) => state.addOrderAttachment);
  const createProduct = useAppStore((state) => state.createProduct);
  const updateProduct = useAppStore((state) => state.updateProduct);
  const deleteProduct = useAppStore((state) => state.deleteProduct);

  const [tab, setTab] = useState<DashboardTab>("overview");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductUpsertPayload>(EMPTY_PRODUCT_FORM);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [attachmentLabels, setAttachmentLabels] = useState<Record<string, string>>({});
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});

  const pendingOrders = orders.filter((order) => order.status === "pending_franchisee");
  const readyOrders = orders.filter((order) => order.status === "ready");
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;

  const analyticsRows = useMemo(
    () => [
      ["TOTAL PRODUCTS", String(metrics.products)],
      ["TOTAL ORDERS", String(metrics.orders)],
      ["READY ORDERS", String(metrics.readyOrders)],
      ["REVENUE", metrics.revenue],
    ],
    [metrics],
  );

  if (redirect) {
    return redirect;
  }

  const hydrateFormFromProduct = (productId: string) => {
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
    });
  };

  return (
    <ScreenShell title="CONTROL TOWER" subtitle="FRANCHISEE / CATALOG / ORDERS" profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.tabRow}>
          {(["overview", "orders", "catalog"] as const).map((item) => (
            <ChoiceChip
              key={item}
              label={item.toUpperCase()}
              active={tab === item}
              onPress={() => setTab(item)}
            />
          ))}
        </View>

        {tab === "overview" ? (
          <>
            <View style={styles.metricsGrid}>
              <MetricCard label="REVENUE" value={metrics.revenue} />
              <MetricCard label="PLAN" value={metrics.plan} />
              <MetricCard label="ORDERS" value={String(metrics.orders)} />
            </View>

            <View style={styles.analyticsGrid}>
              <Panel style={styles.analyticsLead}>
                <StatusPill label="BUSINESS CORE / OPERATIONS" tone="solid" />
                <Text style={[styles.analyticsTitle, { color: theme.colors.textPrimary }]}>
                  THE FRANCHISEE PANEL NOW OWNS CATALOG, ORDER FLOW AND BASIC COMMERCE ANALYTICS
                </Text>
                <Text style={[styles.analyticsCopy, { color: theme.colors.textSecondary }]}>
                  This workspace moves beyond a toy dashboard. It now holds merchandising actions,
                  order routing and quick operational insight inside the same system surface.
                </Text>
              </Panel>

              <Panel style={styles.analyticsVisual}>
                <Image source={selectedProduct?.media[0]?.url ? { uri: selectedProduct.media[0].url } : referenceTechJacket} style={styles.analyticsImage} resizeMode="cover" />
              </Panel>
            </View>

            <Panel>
              <SectionHeading
                title="KEY NUMBERS"
                subtitle="A simple analytics strip to ground future revenue, conversion and SLA reporting."
                compact
              />
              <View style={styles.analyticsRows}>
                {analyticsRows.map(([label, value]) => (
                  <View key={label} style={[styles.analyticsRow, { borderColor: theme.colors.borderSoft }]}>
                    <Text style={[styles.analyticsLabel, { color: theme.colors.textMuted }]}>{label}</Text>
                    <Text style={[styles.analyticsValue, { color: theme.colors.textPrimary }]}>{value}</Text>
                  </View>
                ))}
              </View>
            </Panel>
          </>
        ) : null}

        {tab === "orders" ? (
          <View style={styles.orderColumns}>
            <Panel style={styles.column}>
              <SectionHeading title="NEW ORDERS" subtitle={`${pendingOrders.length} waiting for dispatch`} compact />
              <View style={styles.columnList}>
                {pendingOrders.map((order) => (
                  <Panel key={order.id} style={styles.orderCard}>
                    <StatusPill label={order.number} tone="ghost" />
                    <Text style={[styles.orderProduct, { color: theme.colors.textPrimary }]}>
                      {order.productName}
                    </Text>
                    <Text style={[styles.orderMeta, { color: theme.colors.textSecondary }]}>
                      {order.customerName} / {order.sizeLabel} / {order.totalFormatted}
                    </Text>
                    <Text style={[styles.orderMeta, { color: theme.colors.textSecondary }]}>
                      {order.shippingAddress}
                    </Text>
                    <MonoButton
                      label="SEND TO ATELIER"
                      onPress={() => updateOrderStatus(order.id, "in_production")}
                    />
                    <MonoInput
                      label="ADD COMMENT"
                      value={commentDrafts[order.id] ?? ""}
                      onChangeText={(value) =>
                        setCommentDrafts((current) => ({ ...current, [order.id]: value }))
                      }
                      placeholder="Status note for production"
                    />
                    <MonoButton
                      label="SAVE COMMENT"
                      variant="secondary"
                      onPress={async () => {
                        const message = commentDrafts[order.id]?.trim();
                        if (!message) {
                          return;
                        }
                        await addOrderComment(order.id, message);
                        setCommentDrafts((current) => ({ ...current, [order.id]: "" }));
                      }}
                    />
                  </Panel>
                ))}
              </View>
            </Panel>

            <Panel style={styles.column}>
              <SectionHeading title="READY TO DELIVER" subtitle={`${readyOrders.length} ready for handoff`} compact />
              <View style={styles.columnList}>
                {readyOrders.map((order) => (
                  <Panel key={order.id} style={styles.orderCard}>
                    <StatusPill label={order.number} tone="solid" />
                    <Text style={[styles.orderProduct, { color: theme.colors.textPrimary }]}>
                      {order.productName}
                    </Text>
                    <Text style={[styles.orderMeta, { color: theme.colors.textSecondary }]}>
                      {order.customerName} / {order.contactPhone}
                    </Text>
                    <MonoInput
                      label="FILE LABEL"
                      value={attachmentLabels[order.id] ?? ""}
                      onChangeText={(value) =>
                        setAttachmentLabels((current) => ({ ...current, [order.id]: value }))
                      }
                      placeholder="QC sheet / invoice / note"
                    />
                    <MonoInput
                      label="FILE URL"
                      value={attachmentUrls[order.id] ?? ""}
                      onChangeText={(value) =>
                        setAttachmentUrls((current) => ({ ...current, [order.id]: value }))
                      }
                      placeholder="https://..."
                    />
                    <View style={styles.buttonRow}>
                      <MonoButton
                        label="ADD FILE"
                        variant="secondary"
                        onPress={async () => {
                          const label = attachmentLabels[order.id]?.trim();
                          const url = attachmentUrls[order.id]?.trim();
                          if (!label || !url) {
                            return;
                          }
                          await addOrderAttachment(order.id, { label, url });
                          setAttachmentLabels((current) => ({ ...current, [order.id]: "" }));
                          setAttachmentUrls((current) => ({ ...current, [order.id]: "" }));
                        }}
                      />
                      <MonoButton
                        label="MARK DELIVERED"
                        onPress={() => updateOrderStatus(order.id, "delivered")}
                      />
                    </View>
                  </Panel>
                ))}
              </View>
            </Panel>
          </View>
        ) : null}

        {tab === "catalog" ? (
          <View style={styles.catalogGrid}>
            <Panel style={styles.catalogList}>
              <SectionHeading
                title="CATALOG"
                subtitle="Select an item to edit it, or create a new one with media and sizes."
                compact
              />
              <View style={styles.productList}>
                {products.map((product) => (
                  <PressableProduct
                    key={product.id}
                    label={product.name}
                    meta={`${product.categoryName} / ${product.formattedPrice}`}
                    active={selectedProductId === product.id}
                    imageUrl={product.media[0]?.url}
                    onPress={() => hydrateFormFromProduct(product.id)}
                  />
                ))}
              </View>
            </Panel>

            <Panel style={styles.catalogEditor}>
              <SectionHeading
                title={selectedProduct ? "EDIT PRODUCT" : "CREATE PRODUCT"}
                subtitle="This is the first real catalog editor layer for franchisee operations."
                compact
              />

              <View style={styles.formGrid}>
                <MonoInput
                  label="NAME"
                  value={productForm.name}
                  onChangeText={(value) => setProductForm((current) => ({ ...current, name: value }))}
                  placeholder="Storm Shell GEIM"
                />
                <MonoInput
                  label="SUBTITLE"
                  value={productForm.subtitle}
                  onChangeText={(value) => setProductForm((current) => ({ ...current, subtitle: value }))}
                  placeholder="Premium editorial subtitle"
                />
                <MonoInput
                  label="PRICE AMOUNT"
                  value={String(productForm.priceAmount || "")}
                  onChangeText={(value) =>
                    setProductForm((current) => ({ ...current, priceAmount: Number(value || 0) }))
                  }
                  keyboardType="numeric"
                  placeholder="219000"
                />
                <MonoInput
                  label="CATEGORY ID"
                  value={productForm.categoryId}
                  onChangeText={(value) => setProductForm((current) => ({ ...current, categoryId: value }))}
                  placeholder={categories[0]?.id ?? "c-outerwear"}
                />
                <MonoInput
                  label="COVER URL"
                  value={productForm.coverUrl}
                  onChangeText={(value) => setProductForm((current) => ({ ...current, coverUrl: value }))}
                  placeholder="https://..."
                />
                <MonoInput
                  label="GALLERY URLS"
                  value={productForm.galleryUrls.join(", ")}
                  onChangeText={(value) =>
                    setProductForm((current) => ({
                      ...current,
                      galleryUrls: value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="https://..., https://..."
                />
                <MonoInput
                  label="SIZES"
                  value={productForm.sizeLabels.join(", ")}
                  onChangeText={(value) =>
                    setProductForm((current) => ({
                      ...current,
                      sizeLabels: value
                        .split(",")
                        .map((item) => item.trim().toUpperCase())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="XS, S, M, L"
                />
                <MonoInput
                  label="STYLE TAGS"
                  value={productForm.style.join(", ")}
                  onChangeText={(value) =>
                    setProductForm((current) => ({
                      ...current,
                      style: value
                        .split(",")
                        .map((item) => item.trim().toLowerCase())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="technical, outerwear"
                />
              </View>

              <MonoInput
                label="DESCRIPTION"
                value={productForm.description}
                onChangeText={(value) => setProductForm((current) => ({ ...current, description: value }))}
                multiline
                placeholder="Product description"
              />
              <MonoInput
                label="COMPOSITION"
                value={productForm.composition}
                onChangeText={(value) => setProductForm((current) => ({ ...current, composition: value }))}
                placeholder="Material composition"
              />
              <MonoInput
                label="FITTING NOTES"
                value={productForm.fittingNotes}
                onChangeText={(value) => setProductForm((current) => ({ ...current, fittingNotes: value }))}
                placeholder="Structured fit notes"
              />
              <MonoInput
                label="DELIVERY ESTIMATE"
                value={productForm.deliveryEstimate}
                onChangeText={(value) => setProductForm((current) => ({ ...current, deliveryEstimate: value }))}
                placeholder="Ships in 2-4 days"
              />

              <View style={styles.choiceWrap}>
                <Text style={[styles.choiceLabel, { color: theme.colors.textMuted }]}>AVAILABILITY</Text>
                <View style={styles.buttonRow}>
                  {(["in_stock", "preorder"] as ProductAvailability[]).map((item) => (
                    <ChoiceChip
                      key={item}
                      label={item.toUpperCase()}
                      active={productForm.availability === item}
                      onPress={() =>
                        setProductForm((current) => ({
                          ...current,
                          availability: item,
                        }))
                      }
                    />
                  ))}
                  <ChoiceChip
                    label="FEATURED"
                    active={productForm.featured}
                    onPress={() =>
                      setProductForm((current) => ({ ...current, featured: !current.featured }))
                    }
                  />
                </View>
              </View>

              <View style={styles.buttonRow}>
                <MonoButton
                  label={selectedProduct ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
                  onPress={async () => {
                    if (selectedProduct) {
                      await updateProduct(selectedProduct.id, productForm);
                    } else {
                      await createProduct(productForm);
                    }

                    setSelectedProductId(null);
                    setProductForm(EMPTY_PRODUCT_FORM);
                  }}
                />
                <MonoButton
                  label="RESET"
                  variant="secondary"
                  onPress={() => {
                    setSelectedProductId(null);
                    setProductForm(EMPTY_PRODUCT_FORM);
                  }}
                />
                {selectedProduct ? (
                  <MonoButton
                    label="DELETE PRODUCT"
                    variant="secondary"
                    onPress={async () => {
                      await deleteProduct(selectedProduct.id);
                      setSelectedProductId(null);
                      setProductForm(EMPTY_PRODUCT_FORM);
                    }}
                  />
                ) : null}
              </View>
            </Panel>
          </View>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

function PressableProduct({
  label,
  meta,
  imageUrl,
  active,
  onPress,
}: {
  label: string;
  meta: string;
  imageUrl?: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useResolvedTheme();

  return (
    <View
      style={[
        styles.productRow,
        {
          borderColor: active ? theme.colors.accent : theme.colors.borderSoft,
          backgroundColor: active ? theme.colors.surfaceSecondary : theme.colors.surface,
        },
      ]}
    >
      <Image
        source={imageUrl ? { uri: imageUrl } : referenceTechJacket}
        style={styles.productThumb}
        resizeMode="cover"
      />
      <View style={styles.productCopy}>
        <Text style={[styles.productTitle, { color: theme.colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.productMeta, { color: theme.colors.textSecondary }]}>{meta}</Text>
      </View>
      <MonoButton label="EDIT" variant={active ? "primary" : "secondary"} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 24,
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  analyticsLead: {
    flex: 1,
    minWidth: 300,
    gap: 14,
  },
  analyticsVisual: {
    flex: 0.9,
    minWidth: 300,
    minHeight: 320,
    padding: 0,
    overflow: "hidden",
  },
  analyticsImage: {
    width: "100%",
    height: "100%",
  },
  analyticsTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: 0.8,
  },
  analyticsCopy: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  analyticsRows: {
    gap: 10,
  },
  analyticsRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 6,
  },
  analyticsLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  analyticsValue: {
    fontFamily: "Oswald_500Medium",
    fontSize: 28,
    letterSpacing: 0.8,
  },
  orderColumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "flex-start",
  },
  column: {
    flex: 1,
    minWidth: 300,
    gap: 16,
  },
  columnList: {
    gap: 12,
  },
  orderCard: {
    gap: 12,
  },
  orderProduct: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    letterSpacing: 1,
  },
  orderMeta: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  catalogGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "flex-start",
  },
  catalogList: {
    flex: 0.92,
    minWidth: 320,
    gap: 14,
  },
  productList: {
    gap: 10,
  },
  productRow: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  productThumb: {
    width: 82,
    height: 82,
    borderRadius: 18,
  },
  productCopy: {
    flex: 1,
    gap: 4,
  },
  productTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 24,
    letterSpacing: 0.6,
  },
  productMeta: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  catalogEditor: {
    flex: 1.08,
    minWidth: 340,
    gap: 14,
  },
  formGrid: {
    gap: 12,
  },
  choiceWrap: {
    gap: 10,
  },
  choiceLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
});
