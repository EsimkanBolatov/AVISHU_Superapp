import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useState } from "react";

import { MonoButton } from "../../src/components/MonoButton";
import { MonoInput } from "../../src/components/MonoInput";
import { Panel } from "../../src/components/Panel";
import { ScreenShell } from "../../src/components/ScreenShell";
import { SectionHeading } from "../../src/components/SectionHeading";
import { StatusPill } from "../../src/components/StatusPill";
import { useResolvedTheme } from "../../src/lib/theme";
import { useRequireRole } from "../../src/lib/useRequireRole";
import { useAppStore } from "../../src/store/useAppStore";

export default function ProductionScreen() {
  const redirect = useRequireRole("production");
  const theme = useResolvedTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const orders = useAppStore((state) => state.orders);
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);
  const addOrderComment = useAppStore((state) => state.addOrderComment);
  const addOrderAttachment = useAppStore((state) => state.addOrderAttachment);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});

  if (redirect) {
    return redirect;
  }

  const queue = orders.filter(
    (order) => order.status === "in_production" || order.status === "quality_check",
  );

  return (
    <ScreenShell title="ATELIER TABLET" subtitle="PRODUCTION QUEUE" profileRoute="/profile">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Panel style={styles.leadPanel}>
          <StatusPill
            label={isWide ? "LANDSCAPE-FIRST LAYOUT" : "COMPACT MOBILE LAYOUT"}
            tone="solid"
          />
          <Text style={[styles.leadTitle, { color: theme.colors.textPrimary }]}>
            LARGE CONTROLS. LOW TEXT. HIGH CONTRAST.
          </Text>
          <Text style={[styles.leadCopy, { color: theme.colors.textSecondary }]}>
            The production workspace now supports stage progression, comment capture and file links
            instead of acting like a one-button prototype.
          </Text>
        </Panel>

        <View style={styles.queue}>
          {queue.map((order) => {
            const nextStatus = order.status === "in_production" ? "quality_check" : "ready";

            return (
              <Panel key={order.id} style={[styles.taskCard, isWide && styles.taskCardWide]}>
                <SectionHeading
                  title={order.productName.toUpperCase()}
                  subtitle={`${order.number} / ${order.sizeLabel ?? "NO SIZE"}`}
                  compact
                />

                <View style={styles.taskMeta}>
                  <Text style={[styles.taskText, { color: theme.colors.textSecondary }]}>
                    CLIENT / {order.customerName}
                  </Text>
                  <Text style={[styles.taskText, { color: theme.colors.textSecondary }]}>
                    NOTES / {order.notes}
                  </Text>
                  <Text style={[styles.taskText, { color: theme.colors.textSecondary }]}>
                    DELIVERY / {order.deliveryMethod.toUpperCase()}
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
                  label="ADD STAGE COMMENT"
                  value={commentDrafts[order.id] ?? ""}
                  onChangeText={(value) =>
                    setCommentDrafts((current) => ({ ...current, [order.id]: value }))
                  }
                  placeholder="Cut, assembly or QC update"
                />

                <MonoInput
                  label="FILE URL"
                  value={attachmentUrls[order.id] ?? ""}
                  onChangeText={(value) =>
                    setAttachmentUrls((current) => ({ ...current, [order.id]: value }))
                  }
                  placeholder="https://..."
                />

                <View style={styles.actionRow}>
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
                  <MonoButton
                    label="ADD FILE"
                    variant="secondary"
                    onPress={async () => {
                      const url = attachmentUrls[order.id]?.trim();
                      if (!url) {
                        return;
                      }
                      await addOrderAttachment(order.id, {
                        label: "Production file",
                        url,
                      });
                      setAttachmentUrls((current) => ({ ...current, [order.id]: "" }));
                    }}
                  />
                </View>

                <MonoButton
                  label={nextStatus === "quality_check" ? "MOVE TO QC" : "MARK READY"}
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
