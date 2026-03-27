import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MonoButton } from "../src/components/MonoButton";
import { Panel } from "../src/components/Panel";
import { SectionHeading } from "../src/components/SectionHeading";
import { StatusPill } from "../src/components/StatusPill";
import { useResolvedTheme } from "../src/lib/theme";
import { useAppStore } from "../src/store/useAppStore";
import { Role } from "../src/types";

const ROLES: Array<{
  role: Role;
  eyebrow: string;
  title: string;
  copy: string;
}> = [
  {
    role: "client",
    eyebrow: "B2C / VITRINA",
    title: "КЛИЕНТ",
    copy: "Каталог, карточка товара, покупка, предзаказ, лояльность и трекинг статуса заказа.",
  },
  {
    role: "franchisee",
    eyebrow: "B2B / CONTROL TOWER",
    title: "ФРАНЧАЙЗИ",
    copy: "Дашборд, живая очередь новых заказов и перевод заказа в производство без перезагрузки.",
  },
  {
    role: "production",
    eyebrow: "ATELIER / MASTER TABLET",
    title: "ЦЕХ",
    copy: "Крупные контрастные карточки задач и финализация этапа пошива одним действием.",
  },
];

export default function LoginScreen() {
  const theme = useResolvedTheme();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const login = useAppStore((state) => state.login);
  const isLoading = useAppStore((state) => state.isLoading);

  const handleLogin = async (role: Role) => {
    await login(role);

    if (role === "client") {
      router.replace("/client");
      return;
    }

    if (role === "franchisee") {
      router.replace("/franchisee");
      return;
    }

    router.replace("/production");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <StatusPill label="AVISHU SUPERAPP / CORE MVP" tone="solid" />
          <Text style={[styles.brand, { color: theme.colors.textPrimary }]}>AVISHU</Text>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            ПРЕМИАЛЬНЫЙ CORE-ЭКОСИСТЕМЫ ДЛЯ ВИТРИНЫ, ДАШБОРДА И ЦЕХА
          </Text>
          <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>
            Монохромный интерфейс с живым потоком заказов, адаптивом под web/mobile и
            строгим дизайн-кодом из ТЗ.
          </Text>
          <View style={styles.localeRow}>
            {(["ru", "kk", "en"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => setLanguage(item)}
                style={[
                  styles.localeChip,
                  {
                    backgroundColor:
                      language === item ? theme.colors.textPrimary : theme.colors.surfaceSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.localeText,
                    {
                      color:
                        language === item ? theme.colors.background : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {item.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.grid}>
          {ROLES.map((item, index) => (
            <Panel key={item.role} style={styles.roleCard}>
              <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>{item.eyebrow}</Text>
              <SectionHeading title={item.title} subtitle={item.copy} compact />
              <View style={styles.featureList}>
                <Text style={[styles.feature, { color: theme.colors.textSecondary }]}>
                  0{index + 1} / LIVE ORDER FLOW
                </Text>
                <Text style={[styles.feature, { color: theme.colors.textSecondary }]}>
                  0{index + 4} / RESPONSIVE LAYOUT
                </Text>
                <Text style={[styles.feature, { color: theme.colors.textSecondary }]}>
                  0{index + 7} / STRICT MONOCHROME UI
                </Text>
              </View>
              <MonoButton
                label={isLoading ? "ВХОД..." : `ВОЙТИ КАК ${item.title}`}
                onPress={() => handleLogin(item.role)}
              />
            </Panel>
          ))}
        </View>

        <Panel style={styles.protocol}>
          <Text style={[styles.protocolLabel, { color: theme.colors.textMuted }]}>DEMO FLOW</Text>
          <View style={styles.protocolSteps}>
            {[
              "Клиент оформляет заказ в каталоге.",
              "Франчайзи видит его в новой колонке и отправляет в производство.",
              "Цех завершает этап и клиент сразу получает статус READY.",
            ].map((step, index) => (
              <View key={step} style={styles.protocolRow}>
                <Text style={[styles.protocolIndex, { color: theme.colors.textMuted }]}>
                  0{index + 1}
                </Text>
                <Text style={[styles.protocolText, { color: theme.colors.textSecondary }]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
          {isLoading ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator color={theme.colors.textPrimary} />
            </View>
          ) : null}
        </Panel>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 18,
  },
  hero: {
    gap: 14,
    paddingTop: 12,
  },
  brand: {
    fontFamily: "Oswald_500Medium",
    fontSize: 78,
    letterSpacing: 4,
  },
  title: {
    maxWidth: 760,
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 30,
    lineHeight: 40,
    letterSpacing: 1.6,
  },
  copy: {
    maxWidth: 720,
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  localeRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
  },
  localeChip: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  localeText: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  roleCard: {
    flexBasis: 300,
    flexGrow: 1,
    minHeight: 260,
    justifyContent: "space-between",
    gap: 18,
  },
  eyebrow: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 11,
    letterSpacing: 1.6,
  },
  featureList: {
    gap: 10,
  },
  feature: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    letterSpacing: 0.7,
  },
  protocol: {
    gap: 16,
  },
  protocolLabel: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 11,
    letterSpacing: 1.8,
  },
  protocolSteps: {
    gap: 12,
  },
  protocolRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  protocolIndex: {
    width: 28,
    fontFamily: "Oswald_500Medium",
    fontSize: 20,
  },
  protocolText: {
    flex: 1,
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  loaderRow: {
    paddingTop: 6,
    alignItems: "flex-start",
  },
});
