import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useResolvedTheme } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { AppLanguage, Order, OrderStatus } from "../types";

const STEPS: OrderStatus[] = [
  "pending_franchisee",
  "in_production",
  "quality_check",
  "ready",
  "delivered",
];

const STEP_META: Record<AppLanguage, string[]> = {
  ru: ["ФРАНЧАЙЗИ", "АТЕЛЬЕ", "КОНТРОЛЬ", "ГОТОВО", "ДОСТАВЛЕНО"],
  kk: ["ФРАНЧАЙЗИ", "АТЕЛЬЕ", "БАҚЫЛАУ", "ДАЙЫН", "ЖЕТКІЗІЛДІ"],
  en: ["FRANCHISEE", "ATELIER", "QUALITY", "READY", "DELIVERED"],
};

export function OrderTracker({ order }: { order: Order }) {
  const theme = useResolvedTheme();
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);

  return (
    <View style={styles.base}>
      {STEPS.map((step, index) => {
        const currentIndex = STEPS.indexOf(order.status);
        const active = index <= currentIndex;

        return (
          <View key={step} style={styles.step}>
            <View style={styles.stepHead}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: active ? theme.colors.textPrimary : theme.colors.surfaceSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              />
              {index < STEPS.length - 1 ? (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: active ? theme.colors.textPrimary : theme.colors.border,
                    },
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.stepBody}>
              <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
                {t(`status.${step}`)}
              </Text>
              <Text style={[styles.stepMeta, { color: theme.colors.textMuted }]}>
                {STEP_META[language][index]}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    gap: 12,
    paddingTop: 8,
  },
  step: {
    flexDirection: "row",
    gap: 12,
  },
  stepHead: {
    width: 18,
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderWidth: 1,
  },
  line: {
    width: 1,
    flex: 1,
    marginTop: 6,
  },
  stepBody: {
    flex: 1,
    paddingBottom: 12,
    gap: 4,
  },
  stepTitle: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 13,
    letterSpacing: 0.8,
  },
  stepMeta: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 11,
    letterSpacing: 1.2,
  },
});
