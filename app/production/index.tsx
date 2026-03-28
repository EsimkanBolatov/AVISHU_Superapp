import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { MonoButton } from "../../src/components/MonoButton";
import { MonoInput } from "../../src/components/MonoInput";
import { Panel } from "../../src/components/Panel";
import { ScreenShell } from "../../src/components/ScreenShell";
import { SectionHeading } from "../../src/components/SectionHeading";
import { StatusPill } from "../../src/components/StatusPill";
import { useResolvedTheme } from "../../src/lib/theme";
import { useRequireRole } from "../../src/lib/useRequireRole";
import { useAppStore } from "../../src/store/useAppStore";
import { AppLanguage } from "../../src/types";

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    shellSubtitle: string;
    wide: string;
    compact: string;
    leadTitle: string;
    leadCopy: string;
    client: string;
    notes: string;
    delivery: string;
    addComment: string;
    commentPlaceholder: string;
    fileUrl: string;
    filePlaceholder: string;
    saveComment: string;
    addFile: string;
    moveToQc: string;
    markReady: string;
    productionFile: string;
    noSize: string;
  }
> = {
  ru: {
    shellTitle: "АТЕЛЬЕ",
    shellSubtitle: "ОЧЕРЕДЬ ПРОИЗВОДСТВА",
    wide: "LANDSCAPE-FIRST LAYOUT",
    compact: "COMPACT MOBILE LAYOUT",
    leadTitle: "КРУПНЫЕ КОНТРОЛЫ. МИНИМУМ ТЕКСТА. МАКСИМУМ КОНТРАСТА.",
    leadCopy: "Производственный интерфейс теперь поддерживает смену этапов, комментарии и ссылки на файлы вместо одношагового прототипа.",
    client: "КЛИЕНТ",
    notes: "ПРИМЕЧАНИЯ",
    delivery: "ДОСТАВКА",
    addComment: "ДОБАВИТЬ КОММЕНТАРИЙ ЭТАПА",
    commentPlaceholder: "Обновление по крою, сборке или QC",
    fileUrl: "ССЫЛКА НА ФАЙЛ",
    filePlaceholder: "https://...",
    saveComment: "СОХРАНИТЬ КОММЕНТАРИЙ",
    addFile: "ДОБАВИТЬ ФАЙЛ",
    moveToQc: "ПЕРЕВЕСТИ В QC",
    markReady: "ОТМЕТИТЬ ГОТОВЫМ",
    productionFile: "Производственный файл",
    noSize: "БЕЗ РАЗМЕРА",
  },
  kk: {
    shellTitle: "АТЕЛЬЕ",
    shellSubtitle: "ӨНДІРІС КЕЗЕГІ",
    wide: "LANDSCAPE-FIRST LAYOUT",
    compact: "COMPACT MOBILE LAYOUT",
    leadTitle: "ІРІ БАСҚАРУ. АЗ МӘТІН. ЖОҒАРЫ КОНТРАСТ.",
    leadCopy: "Өндірістік интерфейс енді кезең ауыстыруды, пікірлерді және файл сілтемелерін қолдайды.",
    client: "КЛИЕНТ",
    notes: "ЕСКЕРТПЕ",
    delivery: "ЖЕТКІЗУ",
    addComment: "КЕЗЕҢ ПІКІРІН ҚОСУ",
    commentPlaceholder: "Пішу, жинау немесе QC жаңартуы",
    fileUrl: "ФАЙЛ СІЛТЕМЕСІ",
    filePlaceholder: "https://...",
    saveComment: "ПІКІРДІ САҚТАУ",
    addFile: "ФАЙЛ ҚОСУ",
    moveToQc: "QC-КЕ ӨТКІЗУ",
    markReady: "ДАЙЫН ДЕП БЕЛГІЛЕУ",
    productionFile: "Өндіріс файлы",
    noSize: "ӨЛШЕМ ЖОҚ",
  },
  en: {
    shellTitle: "ATELIER TABLET",
    shellSubtitle: "PRODUCTION QUEUE",
    wide: "LANDSCAPE-FIRST LAYOUT",
    compact: "COMPACT MOBILE LAYOUT",
    leadTitle: "LARGE CONTROLS. LOW TEXT. HIGH CONTRAST.",
    leadCopy: "The production workspace now supports stage progression, comment capture and file links instead of a one-button prototype.",
    client: "CLIENT",
    notes: "NOTES",
    delivery: "DELIVERY",
    addComment: "ADD STAGE COMMENT",
    commentPlaceholder: "Cut, assembly or QC update",
    fileUrl: "FILE URL",
    filePlaceholder: "https://...",
    saveComment: "SAVE COMMENT",
    addFile: "ADD FILE",
    moveToQc: "MOVE TO QC",
    markReady: "MARK READY",
    productionFile: "Production file",
    noSize: "NO SIZE",
  },
};

export default function ProductionScreen() {
  const redirect = useRequireRole("production");
  const theme = useResolvedTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const language = useAppStore((state) => state.language);
  const orders = useAppStore((state) => state.orders);
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);
  const addOrderComment = useAppStore((state) => state.addOrderComment);
  const addOrderAttachment = useAppStore((state) => state.addOrderAttachment);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
  const copy = COPY[language];

  if (redirect) {
    return redirect;
  }

  const queue = orders.filter(
    (order) => order.status === "in_production" || order.status === "quality_check",
  );

  return (
    <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle} profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.leadPanel}>
          <StatusPill label={isWide ? copy.wide : copy.compact} tone="solid" />
          <Text style={[styles.leadTitle, { color: theme.colors.textPrimary }]}>{copy.leadTitle}</Text>
          <Text style={[styles.leadCopy, { color: theme.colors.textSecondary }]}>{copy.leadCopy}</Text>
        </Panel>

        <View style={styles.queue}>
          {queue.map((order) => {
            const nextStatus = order.status === "in_production" ? "quality_check" : "ready";

            return (
              <Panel key={order.id} style={[styles.taskCard, isWide && styles.taskCardWide]}>
                <SectionHeading
                  title={order.productName.toUpperCase()}
                  subtitle={`${order.number} / ${order.sizeLabel ?? copy.noSize}`}
                  compact
                />

                <View style={styles.taskMeta}>
                  <Text style={[styles.taskText, { color: theme.colors.textSecondary }]}>
                    {copy.client} / {order.customerName}
                  </Text>
                  <Text style={[styles.taskText, { color: theme.colors.textSecondary }]}>
                    {copy.notes} / {order.notes}
                  </Text>
                  <Text style={[styles.taskText, { color: theme.colors.textSecondary }]}>
                    {copy.delivery} / {order.deliveryMethod.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.commentList}>
                  {order.comments.map((comment) => (
                    <View key={comment.id} style={[styles.commentRow, { borderColor: theme.colors.borderSoft }]}>
                      <Text style={[styles.commentMeta, { color: theme.colors.textMuted }]}>
                        {comment.authorRole.toUpperCase()} / {comment.authorName}
                      </Text>
                      <Text style={[styles.commentText, { color: theme.colors.textSecondary }]}>
                        {comment.message}
                      </Text>
                    </View>
                  ))}
                </View>

                <MonoInput
                  label={copy.addComment}
                  value={commentDrafts[order.id] ?? ""}
                  onChangeText={(value) =>
                    setCommentDrafts((current) => ({ ...current, [order.id]: value }))
                  }
                  placeholder={copy.commentPlaceholder}
                />

                <MonoInput
                  label={copy.fileUrl}
                  value={attachmentUrls[order.id] ?? ""}
                  onChangeText={(value) =>
                    setAttachmentUrls((current) => ({ ...current, [order.id]: value }))
                  }
                  placeholder={copy.filePlaceholder}
                />

                <View style={styles.actionRow}>
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
                  <MonoButton
                    label={copy.addFile}
                    variant="secondary"
                    onPress={async () => {
                      const url = attachmentUrls[order.id]?.trim();
                      if (!url) {
                        return;
                      }
                      await addOrderAttachment(order.id, {
                        label: copy.productionFile,
                        url,
                      });
                      setAttachmentUrls((current) => ({ ...current, [order.id]: "" }));
                    }}
                  />
                </View>

                <MonoButton
                  label={nextStatus === "quality_check" ? copy.moveToQc : copy.markReady}
                  size="large"
                  onPress={() => updateOrderStatus(order.id, nextStatus)}
                />
              </Panel>
            );
          })}
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
    lineHeight: 42,
    letterSpacing: 1.2,
  },
  leadCopy: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 760,
  },
  queue: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  taskCard: {
    flexBasis: 320,
    flexGrow: 1,
    gap: 18,
    minHeight: 240,
    justifyContent: "space-between",
  },
  taskCardWide: {
    flexBasis: 420,
  },
  taskMeta: {
    gap: 10,
  },
  taskText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 14,
    letterSpacing: 0.6,
  },
  commentList: {
    gap: 8,
  },
  commentRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 4,
  },
  commentMeta: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  commentText: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
