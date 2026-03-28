import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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
import { AppLanguage, OrderStatus } from "../../src/types";

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    shellSubtitle: string;
    serviceTitle: string;
    serviceSubtitle: string;
    notifications: string;
    markRead: string;
    queueTitle: string;
    queueSubtitle: string;
    tags: string;
    tagsPlaceholder: string;
    qc: string;
    qcPlaceholder: string;
    sla: string;
    priority: string;
    confirmReady: string;
    confirmDelivered: string;
    requestReturn: string;
    requestExchange: string;
    cancel: string;
    markComplete: string;
    none: string;
  }
> = {
  ru: {
    shellTitle: "SUPPORT",
    shellSubtitle: "CRM / SLA / CLIENT SERVICE",
    serviceTitle: "Клиентский сервис и post-order слой",
    serviceSubtitle: "Support отделяет клиентскую коммуникацию, возвраты, обмены, доставку и уведомления от production и franchisee.",
    notifications: "Уведомления",
    markRead: "Прочитано",
    queueTitle: "Сервисная очередь",
    queueSubtitle: "Заказы в ready, delivered, return/exchange сценариях и спорных состояниях.",
    tags: "Теги",
    tagsPlaceholder: "vip, return, stylist",
    qc: "QC / Service note",
    qcPlaceholder: "Комментарий для клиентского сервиса и возвратов",
    sla: "SLA часов",
    priority: "Приоритет",
    confirmReady: "Подтвердить готовность",
    confirmDelivered: "Подтвердить доставку",
    requestReturn: "Запросить возврат",
    requestExchange: "Запросить обмен",
    cancel: "Отменить заказ",
    markComplete: "Сохранить workflow",
    none: "Нет элементов",
  },
  kk: {
    shellTitle: "SUPPORT",
    shellSubtitle: "CRM / SLA / CLIENT SERVICE",
    serviceTitle: "Клиенттік сервис және post-order қабаты",
    serviceSubtitle: "Support клиентпен байланыс, қайтарым, айырбас, жеткізу және хабарламаларды production мен franchisee-ден бөледі.",
    notifications: "Хабарламалар",
    markRead: "Оқылды",
    queueTitle: "Сервис кезегі",
    queueSubtitle: "Ready, delivered, return/exchange және даулы күйлердегі тапсырыстар.",
    tags: "Тегтер",
    tagsPlaceholder: "vip, return, stylist",
    qc: "QC / Service note",
    qcPlaceholder: "Клиенттік сервис пен қайтарымға арналған жазба",
    sla: "SLA сағат",
    priority: "Басымдық",
    confirmReady: "Дайын деп бекіту",
    confirmDelivered: "Жеткізілді деп бекіту",
    requestReturn: "Қайтарым сұрау",
    requestExchange: "Айырбас сұрау",
    cancel: "Тапсырысты тоқтату",
    markComplete: "Workflow сақтау",
    none: "Элемент жоқ",
  },
  en: {
    shellTitle: "SUPPORT",
    shellSubtitle: "CRM / SLA / CLIENT SERVICE",
    serviceTitle: "Client service and post-order layer",
    serviceSubtitle: "Support owns client communication, returns, exchanges, delivery confirmation and service notifications apart from franchisee and production.",
    notifications: "Notifications",
    markRead: "Mark read",
    queueTitle: "Service queue",
    queueSubtitle: "Orders in ready, delivered, return/exchange and exception states.",
    tags: "Tags",
    tagsPlaceholder: "vip, return, stylist",
    qc: "QC / Service note",
    qcPlaceholder: "Customer-service note for delivery, returns or recovery",
    sla: "SLA hours",
    priority: "Priority",
    confirmReady: "Confirm ready",
    confirmDelivered: "Confirm delivered",
    requestReturn: "Request return",
    requestExchange: "Request exchange",
    cancel: "Cancel order",
    markComplete: "Save workflow",
    none: "No items yet",
  },
};

export default function SupportScreen() {
  const redirect = useRequireRole("support");
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const orders = useAppStore((state) => state.orders);
  const notifications = useAppStore((state) => state.notifications);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const updateOrderWorkflow = useAppStore((state) => state.updateOrderWorkflow);
  const copy = COPY[language];

  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});
  const [qcDrafts, setQcDrafts] = useState<Record<string, string>>({});
  const [slaDrafts, setSlaDrafts] = useState<Record<string, string>>({});
  const [priorityDrafts, setPriorityDrafts] = useState<Record<string, "standard" | "high" | "vip">>({});

  const serviceOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["ready", "delivered", "return_requested", "exchange_requested", "cancelled"].includes(order.status),
      ),
    [orders],
  );

  if (redirect) {
    return redirect;
  }

  async function applyWorkflow(orderId: string, status?: OrderStatus) {
    await updateOrderWorkflow(orderId, {
      status,
      tags:
        tagDrafts[orderId]
          ?.split(",")
          .map((item) => item.trim())
          .filter(Boolean) ?? [],
      qcChecklist: qcDrafts[orderId] ?? undefined,
      slaHours: slaDrafts[orderId] ? Number(slaDrafts[orderId]) : undefined,
      priority: priorityDrafts[orderId],
      notifyClient: true,
    });
  }

  return (
    <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle} profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.leadPanel}>
          <StatusPill label="CLIENT SUCCESS / AFTERSALES" tone="solid" />
          <Text style={[styles.leadTitle, { color: theme.colors.textPrimary }]}>{copy.serviceTitle}</Text>
          <Text style={[styles.leadSubtitle, { color: theme.colors.textSecondary }]}>{copy.serviceSubtitle}</Text>
        </Panel>

        <View style={styles.grid}>
          <Panel style={styles.notificationsPanel}>
            <SectionHeading title={copy.notifications} subtitle={copy.serviceSubtitle} compact />
            <View style={styles.stack}>
              {notifications.length ? (
                notifications.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.notificationCard,
                      {
                        borderColor: theme.colors.borderSoft,
                        backgroundColor: theme.colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <View style={styles.notificationHead}>
                      <Text style={[styles.notificationTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                      {!item.read ? (
                        <MonoButton label={copy.markRead} variant="secondary" onPress={() => markNotificationRead(item.id)} />
                      ) : null}
                    </View>
                    <Text style={[styles.notificationBody, { color: theme.colors.textSecondary }]}>{item.body}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.notificationBody, { color: theme.colors.textSecondary }]}>{copy.none}</Text>
              )}
            </View>
          </Panel>

          <Panel style={styles.queuePanel}>
            <SectionHeading title={copy.queueTitle} subtitle={copy.queueSubtitle} compact />
            <View style={styles.stack}>
              {serviceOrders.length ? (
                serviceOrders.map((order) => (
                  <View
                    key={order.id}
                    style={[
                      styles.orderCard,
                      {
                        borderColor: theme.colors.borderSoft,
                        backgroundColor: theme.colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <View style={styles.orderHead}>
                      <View style={styles.orderCopy}>
                        <Text style={[styles.orderTitle, { color: theme.colors.textPrimary }]}>{order.number}</Text>
                        <Text style={[styles.orderMeta, { color: theme.colors.textSecondary }]}>
                          {order.customerName} / {order.productName}
                        </Text>
                        <Text style={[styles.orderMeta, { color: theme.colors.textSecondary }]}>
                          {order.status.toUpperCase()} / {order.priority.toUpperCase()} / SLA {order.slaHours}h
                        </Text>
                      </View>
                      <StatusPill label={order.paymentStatus.toUpperCase()} tone="ghost" />
                    </View>

                    <MonoInput
                      label={copy.tags}
                      value={tagDrafts[order.id] ?? order.internalTags.join(", ")}
                      onChangeText={(value) => setTagDrafts((current) => ({ ...current, [order.id]: value }))}
                      placeholder={copy.tagsPlaceholder}
                    />
                    <MonoInput
                      label={copy.qc}
                      value={qcDrafts[order.id] ?? order.qcChecklist ?? ""}
                      onChangeText={(value) => setQcDrafts((current) => ({ ...current, [order.id]: value }))}
                      placeholder={copy.qcPlaceholder}
                      multiline
                    />
                    <View style={styles.inlineGrid}>
                      <MonoInput
                        label={copy.sla}
                        value={slaDrafts[order.id] ?? String(order.slaHours)}
                        onChangeText={(value) => setSlaDrafts((current) => ({ ...current, [order.id]: value }))}
                        keyboardType="numeric"
                      />
                      <View style={styles.priorityBlock}>
                        <Text style={[styles.label, { color: theme.colors.textMuted }]}>{copy.priority}</Text>
                        <View style={styles.choiceRow}>
                          {(["standard", "high", "vip"] as const).map((priority) => (
                            <ChoiceChip
                              key={priority}
                              label={priority.toUpperCase()}
                              active={(priorityDrafts[order.id] ?? order.priority) === priority}
                              onPress={() =>
                                setPriorityDrafts((current) => ({ ...current, [order.id]: priority }))
                              }
                            />
                          ))}
                        </View>
                      </View>
                    </View>

                    <View style={styles.actions}>
                      <MonoButton label={copy.confirmReady} variant="secondary" onPress={() => applyWorkflow(order.id, "ready")} />
                      <MonoButton label={copy.confirmDelivered} variant="secondary" onPress={() => applyWorkflow(order.id, "delivered")} />
                      <MonoButton label={copy.requestReturn} variant="secondary" onPress={() => applyWorkflow(order.id, "return_requested")} />
                      <MonoButton label={copy.requestExchange} variant="secondary" onPress={() => applyWorkflow(order.id, "exchange_requested")} />
                      <MonoButton label={copy.cancel} variant="secondary" onPress={() => applyWorkflow(order.id, "cancelled")} />
                    </View>

                    <MonoButton label={copy.markComplete} onPress={() => applyWorkflow(order.id)} />
                  </View>
                ))
              ) : (
                <Text style={[styles.notificationBody, { color: theme.colors.textSecondary }]}>{copy.none}</Text>
              )}
            </View>
          </Panel>
        </View>
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
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: 0.9,
  },
  leadSubtitle: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 860,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "flex-start",
  },
  notificationsPanel: {
    flex: 0.78,
    minWidth: 320,
    gap: 14,
  },
  queuePanel: {
    flex: 1.22,
    minWidth: 360,
    gap: 14,
  },
  stack: {
    gap: 12,
  },
  notificationCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  notificationHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  notificationTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 22,
    letterSpacing: 0.7,
  },
  notificationBody: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  orderCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  orderHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  orderCopy: {
    flex: 1,
    minWidth: 220,
    gap: 4,
  },
  orderTitle: {
    fontFamily: "Oswald_500Medium",
    fontSize: 28,
    letterSpacing: 0.8,
  },
  orderMeta: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    lineHeight: 20,
  },
  inlineGrid: {
    gap: 12,
  },
  priorityBlock: {
    gap: 8,
  },
  label: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
