import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { MonoButton } from "../../../src/components/MonoButton";
import { Panel } from "../../../src/components/Panel";
import { ScreenShell } from "../../../src/components/ScreenShell";
import { SectionHeading } from "../../../src/components/SectionHeading";
import { useResolvedTheme } from "../../../src/lib/theme";
import { useRequireRole } from "../../../src/lib/useRequireRole";
import { useAppStore } from "../../../src/store/useAppStore";

export default function CheckoutScreen() {
  const redirect = useRequireRole("client");
  const theme = useResolvedTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const orders = useAppStore((state) => state.orders);

  if (redirect) {
    return redirect;
  }

  const order = orders.find((item) => item.id === params.id);

  return (
    <ScreenShell title="PAYMENT" subtitle="SUCCESS STUB" profileRoute="/profile">
      <View style={styles.container}>
        <Panel style={styles.panel}>
          <SectionHeading
            title="ОПЛАТА УСПЕШНА"
            subtitle="По ТЗ этот экран может оставаться заглушкой, но заказ уже зарегистрирован в системе."
          />
          <Text style={[styles.orderCode, { color: theme.colors.textPrimary }]}>
            {order?.number ?? params.id}
          </Text>
          <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>
            Теперь заказ автоматически виден франчайзи, а дальнейший прогресс будет отражаться в
            профиле клиента в реальном времени.
          </Text>
          <View style={styles.actions}>
            <MonoButton label="В ПРОФИЛЬ" onPress={() => router.push("/profile")} />
            <MonoButton
              label="НА ГЛАВНУЮ"
              variant="secondary"
              onPress={() => router.replace("/client")}
            />
          </View>
        </Panel>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },
  panel: {
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
    gap: 18,
  },
  orderCode: {
    fontFamily: "Oswald_500Medium",
    fontSize: 54,
    letterSpacing: 2,
  },
  copy: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
