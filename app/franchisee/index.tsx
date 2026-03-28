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
import { AppLanguage } from "../../src/types";

type FranchiseeTab = "overview" | "orders";

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    shellSubtitle: string;
    overview: string;
    orders: string;
    revenue: string;
    plan: string;
    orderCount: string;
    leadBadge: string;
    leadTitle: string;
    leadSubtitle: string;
    numbersTitle: string;
    numbersSubtitle: string;
    totalProducts: string;
    totalOrders: string;
    readyOrders: string;
    revenueTotal: string;
    newOrdersTitle: string;
    newOrdersSubtitle: (count: number) => string;
    readyTitle: string;
    readySubtitle: (count: number) => string;
    sendToAtelier: string;
    addComment: string;
    addCommentPlaceholder: string;
    saveComment: string;
    fileLabel: string;
    fileLabelPlaceholder: string;
    fileUrl: string;
    addFile: string;
    markDelivered: string;
  }
> = {
  ru: {
    shellTitle: "ФРАНЧАЙЗИ",
    shellSubtitle: "ОПЕРАЦИИ / МАРШРУТИЗАЦИЯ ЗАКАЗОВ",
    overview: "ОБЗОР",
    orders: "ЗАКАЗЫ",
    revenue: "ВЫРУЧКА",
    plan: "ПЛАН",
    orderCount: "ЗАКАЗЫ",
    leadBadge: "FRANCHISEE / OPERATIONS DESK",
    leadTitle: "ОПЕРАЦИОННАЯ ПОВЕРХНОСТЬ ФРАНЧАЙЗИ БЕЗ СМЕШЕНИЯ С АДМИНОМ КАТАЛОГА",
    leadSubtitle: "Эта роль отвечает за прием заказов, передачу в производство и выдачу готовых заказов. Каталог и витрина вынесены в отдельный admin-layer.",
    numbersTitle: "КЛЮЧЕВЫЕ ЧИСЛА",
    numbersSubtitle: "Короткая analytics-полоска для контроля оборота, заказов и готовых позиций.",
    totalProducts: "ВСЕГО ТОВАРОВ",
    totalOrders: "ВСЕГО ЗАКАЗОВ",
    readyOrders: "ГОТОВЫЕ ЗАКАЗЫ",
    revenueTotal: "ВЫРУЧКА",
    newOrdersTitle: "НОВЫЕ ЗАКАЗЫ",
    newOrdersSubtitle: (count) => `${count} ожидают передачи в ателье`,
    readyTitle: "ГОТОВО К ВЫДАЧЕ",
    readySubtitle: (count) => `${count} готовы к передаче клиенту`,
    sendToAtelier: "ОТПРАВИТЬ В АТЕЛЬЕ",
    addComment: "ДОБАВИТЬ КОММЕНТАРИЙ",
    addCommentPlaceholder: "Статусная заметка для производства",
    saveComment: "СОХРАНИТЬ КОММЕНТАРИЙ",
    fileLabel: "НАЗВАНИЕ ФАЙЛА",
    fileLabelPlaceholder: "QC sheet / invoice / note",
    fileUrl: "ССЫЛКА НА ФАЙЛ",
    addFile: "ДОБАВИТЬ ФАЙЛ",
    markDelivered: "ОТМЕТИТЬ ДОСТАВЛЕННЫМ",
  },
  kk: {
    shellTitle: "ФРАНЧАЙЗИ",
    shellSubtitle: "ОПЕРАЦИЯЛАР / ТАПСЫРЫСТАРДЫ БАҒЫТТАУ",
    overview: "ШОЛУ",
    orders: "ТАПСЫРЫСТАР",
    revenue: "ТАБЫС",
    plan: "ЖОСПАР",
    orderCount: "ТАПСЫРЫС",
    leadBadge: "FRANCHISEE / OPERATIONS DESK",
    leadTitle: "КАТАЛОГ ӘКІМШІСІМЕН АРАЛАСПАЙТЫН ФРАНЧАЙЗИ ОПЕРАЦИЯЛЫҚ БЕТІ",
    leadSubtitle: "Бұл рөл тапсырыстарды қабылдайды, өндірісқа жібереді және дайын тапсырысты клиентке береді. Каталог пен витрина бөлек admin-layer-ге шығарылған.",
    numbersTitle: "НЕГІЗГІ КӨРСЕТКІШТЕР",
    numbersSubtitle: "Айналымды, тапсырыстарды және дайын позицияларды бақылауға арналған қысқа analytics жолағы.",
    totalProducts: "ӨНІМ БАРЛЫҒЫ",
    totalOrders: "ТАПСЫРЫС БАРЛЫҒЫ",
    readyOrders: "ДАЙЫН ТАПСЫРЫС",
    revenueTotal: "ТАБЫС",
    newOrdersTitle: "ЖАҢА ТАПСЫРЫСТАР",
    newOrdersSubtitle: (count) => `${count} ательеге жіберуді күтуде`,
    readyTitle: "БЕРУГЕ ДАЙЫН",
    readySubtitle: (count) => `${count} клиентке беруге дайын`,
    sendToAtelier: "АТЕЛЬЕГЕ ЖІБЕРУ",
    addComment: "ПІКІР ҚОСУ",
    addCommentPlaceholder: "Өндіріс үшін статус ескертпесі",
    saveComment: "ПІКІРДІ САҚТАУ",
    fileLabel: "ФАЙЛ АТАУЫ",
    fileLabelPlaceholder: "QC sheet / invoice / note",
    fileUrl: "ФАЙЛ СІЛТЕМЕСІ",
    addFile: "ФАЙЛ ҚОСУ",
    markDelivered: "ЖЕТКІЗІЛДІ ДЕП БЕЛГІЛЕУ",
  },
  en: {
    shellTitle: "FRANCHISEE",
    shellSubtitle: "OPERATIONS / ORDER ROUTING",
    overview: "OVERVIEW",
    orders: "ORDERS",
    revenue: "REVENUE",
    plan: "PLAN",
    orderCount: "ORDERS",
    leadBadge: "FRANCHISEE / OPERATIONS DESK",
    leadTitle: "A FRANCHISEE OPERATIONS SURFACE THAT NO LONGER COLLIDES WITH CATALOG ADMIN",
    leadSubtitle: "This role owns order intake, routing into production and client handoff. Catalog and storefront management live inside a separate admin layer.",
    numbersTitle: "KEY NUMBERS",
    numbersSubtitle: "A compact analytics strip for revenue, order flow and ready stock handoff.",
    totalProducts: "TOTAL PRODUCTS",
    totalOrders: "TOTAL ORDERS",
    readyOrders: "READY ORDERS",
    revenueTotal: "REVENUE",
    newOrdersTitle: "NEW ORDERS",
    newOrdersSubtitle: (count) => `${count} waiting for atelier dispatch`,
    readyTitle: "READY TO DELIVER",
    readySubtitle: (count) => `${count} ready for client handoff`,
    sendToAtelier: "SEND TO ATELIER",
    addComment: "ADD COMMENT",
    addCommentPlaceholder: "Status note for production",
    saveComment: "SAVE COMMENT",
    fileLabel: "FILE LABEL",
    fileLabelPlaceholder: "QC sheet / invoice / note",
    fileUrl: "FILE URL",
    addFile: "ADD FILE",
    markDelivered: "MARK DELIVERED",
  },
};

export default function FranchiseeScreen() {
  const redirect = useRequireRole("franchisee");
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const metrics = useAppStore((state) => state.metrics);
  const orders = useAppStore((state) => state.orders);
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);
  const addOrderComment = useAppStore((state) => state.addOrderComment);
  const addOrderAttachment = useAppStore((state) => state.addOrderAttachment);
  const products = useAppStore((state) => state.products);
  const copy = COPY[language];

  const [tab, setTab] = useState<FranchiseeTab>("overview");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [attachmentLabels, setAttachmentLabels] = useState<Record<string, string>>({});
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});

  const pendingOrders = orders.filter((order) => order.status === "pending_franchisee");
  const readyOrders = orders.filter((order) => order.status === "ready");
  const leadVisual = products.find((product) => product.featured) ?? products[0] ?? null;

  const analyticsRows = useMemo(
    () => [
      [copy.totalProducts, String(metrics.products)],
      [copy.totalOrders, String(metrics.orders)],
      [copy.readyOrders, String(metrics.readyOrders)],
      [copy.revenueTotal, metrics.revenue],
    ],
    [copy.readyOrders, copy.revenueTotal, copy.totalOrders, copy.totalProducts, metrics],
  );

  if (redirect) {
    return redirect;
  }

  return (
    <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle} profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.tabRow}>
          {([
            ["overview", copy.overview],
            ["orders", copy.orders],
          ] as const).map(([value, label]) => (
            <ChoiceChip
              key={value}
              label={label}
              active={tab === value}
              onPress={() => setTab(value)}
            />
          ))}
        </View>

        {tab === "overview" ? (
          <>
            <View style={styles.metricsGrid}>
              <MetricCard label={copy.revenue} value={metrics.revenue} />
              <MetricCard label={copy.plan} value={metrics.plan} />
              <MetricCard label={copy.orderCount} value={String(metrics.orders)} />
            </View>

            <View style={styles.analyticsGrid}>
              <Panel style={styles.analyticsLead}>
                <StatusPill label={copy.leadBadge} tone="solid" />
                <Text style={[styles.analyticsTitle, { color: theme.colors.textPrimary }]}>
                  {copy.leadTitle}
                </Text>
                <Text style={[styles.analyticsCopy, { color: theme.colors.textSecondary }]}>
                  {copy.leadSubtitle}
                </Text>
              </Panel>

              <Panel style={styles.analyticsVisual}>
                <Image
                  source={leadVisual?.media[0]?.url ? { uri: leadVisual.media[0].url } : referenceTechJacket}
                  style={styles.analyticsImage}
                  resizeMode="cover"
                />
              </Panel>
            </View>

            <Panel>
              <SectionHeading title={copy.numbersTitle} subtitle={copy.numbersSubtitle} compact />
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
              <SectionHeading
                title={copy.newOrdersTitle}
                subtitle={copy.newOrdersSubtitle(pendingOrders.length)}
                compact
              />
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
                      label={copy.sendToAtelier}
                      onPress={() => updateOrderStatus(order.id, "in_production")}
                    />
                    <MonoInput
                      label={copy.addComment}
                      value={commentDrafts[order.id] ?? ""}
                      onChangeText={(value) =>
                        setCommentDrafts((current) => ({ ...current, [order.id]: value }))
                      }
                      placeholder={copy.addCommentPlaceholder}
                    />
                    <MonoButton
                      label={copy.saveComment}
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
              <SectionHeading title={copy.readyTitle} subtitle={copy.readySubtitle(readyOrders.length)} compact />
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
                      label={copy.fileLabel}
                      value={attachmentLabels[order.id] ?? ""}
                      onChangeText={(value) =>
                        setAttachmentLabels((current) => ({ ...current, [order.id]: value }))
                      }
                      placeholder={copy.fileLabelPlaceholder}
                    />
                    <MonoInput
                      label={copy.fileUrl}
                      value={attachmentUrls[order.id] ?? ""}
                      onChangeText={(value) =>
                        setAttachmentUrls((current) => ({ ...current, [order.id]: value }))
                      }
                      placeholder="https://..."
                    />
                    <View style={styles.buttonRow}>
                      <MonoButton
                        label={copy.addFile}
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
                        label={copy.markDelivered}
                        onPress={() => updateOrderStatus(order.id, "delivered")}
                      />
                    </View>
                  </Panel>
                ))}
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
});
