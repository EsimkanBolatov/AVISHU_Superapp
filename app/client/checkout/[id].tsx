import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { ScreenShell } from "../../../src/components/ScreenShell";
import { CheckoutExperience } from "../../../src/features/client/checkout/CheckoutExperience";
import { useRequireRole } from "../../../src/lib/useRequireRole";
import { useAppStore } from "../../../src/store/useAppStore";
import { AppLanguage, DeliveryMethod, PaymentMethod } from "../../../src/types";

const COPY: Record<
  AppLanguage,
  {
    shellPayment: string;
    shellConfirmation: string;
    headerMeta: string;
    confirmedTitle: string;
    confirmedSubtitle: string;
    status: string;
    payment: string;
    delivery: string;
    address: string;
    openProfile: string;
    backToClient: string;
    realCheckout: string;
    realCheckoutSubtitle: string;
    paymentMethod: string;
    deliveryMethod: string;
    shippingAddress: string;
    contactPhone: string;
    notes: string;
    shippingPlaceholder: string;
    phonePlaceholder: string;
    notesPlaceholder: string;
    preorderDate: string;
    linkedTryOn: string;
    placing: string;
    confirm: string;
    back: string;
    size: string;
  }
> = {
  ru: {
    shellPayment: "Оплата",
    shellConfirmation: "Подтверждение",
    headerMeta: "CLIENT FLOW / ORDER IS ALREADY LIVE",
    confirmedTitle: "Заказ подтвержден",
    confirmedSubtitle: "Этот заказ уже записан в operational-flow и виден бизнес-ролям в реальном времени.",
    status: "Статус",
    payment: "Оплата",
    delivery: "Доставка",
    address: "Адрес",
    openProfile: "Открыть профиль",
    backToClient: "Назад к витрине",
    realCheckout: "Реальный checkout",
    realCheckoutSubtitle: "Шаг фиксирует оплату, доставку, адрес и связку с try-on, если она была сохранена заранее.",
    paymentMethod: "Способ оплаты",
    deliveryMethod: "Способ доставки",
    shippingAddress: "Адрес доставки",
    contactPhone: "Контактный телефон",
    notes: "Примечания",
    shippingPlaceholder: "Город, улица, дом, квартира",
    phonePlaceholder: "+7 ...",
    notesPlaceholder: "Комментарий к упаковке, посадке или доставке",
    preorderDate: "Дата предзаказа",
    linkedTryOn: "Связанный try-on",
    placing: "Создание заказа...",
    confirm: "Подтвердить заказ",
    back: "Назад",
    size: "Размер",
  },
  kk: {
    shellPayment: "Төлем",
    shellConfirmation: "Растау",
    headerMeta: "CLIENT FLOW / ORDER IS ALREADY LIVE",
    confirmedTitle: "Тапсырыс расталды",
    confirmedSubtitle: "Бұл тапсырыс operational-flow ішіне жазылып, бизнес-рөлдерге нақты уақытта көрінеді.",
    status: "Статус",
    payment: "Төлем",
    delivery: "Жеткізу",
    address: "Мекенжай",
    openProfile: "Профильді ашу",
    backToClient: "Витринаға қайту",
    realCheckout: "Нақты checkout",
    realCheckoutSubtitle: "Бұл қадам төлемді, жеткізуді, мекенжайды және сақталған try-on байланысын бекітеді.",
    paymentMethod: "Төлем тәсілі",
    deliveryMethod: "Жеткізу тәсілі",
    shippingAddress: "Жеткізу мекенжайы",
    contactPhone: "Байланыс телефоны",
    notes: "Ескертпе",
    shippingPlaceholder: "Қала, көше, үй, пәтер",
    phonePlaceholder: "+7 ...",
    notesPlaceholder: "Қаптама, отырымы немесе жеткізу туралы түсініктеме",
    preorderDate: "Алдын ала тапсырыс күні",
    linkedTryOn: "Байланған try-on",
    placing: "Тапсырыс жасалуда...",
    confirm: "Тапсырысты растау",
    back: "Артқа",
    size: "Өлшем",
  },
  en: {
    shellPayment: "Payment",
    shellConfirmation: "Confirmation",
    headerMeta: "CLIENT FLOW / ORDER IS ALREADY LIVE",
    confirmedTitle: "Order confirmed",
    confirmedSubtitle: "This order is already written into the operational flow and visible to business roles in real time.",
    status: "Status",
    payment: "Payment",
    delivery: "Delivery",
    address: "Address",
    openProfile: "Open profile",
    backToClient: "Back to vitrina",
    realCheckout: "Real checkout",
    realCheckoutSubtitle: "This step captures payment, delivery, address and any saved try-on linkage.",
    paymentMethod: "Payment method",
    deliveryMethod: "Delivery method",
    shippingAddress: "Shipping address",
    contactPhone: "Contact phone",
    notes: "Notes",
    shippingPlaceholder: "City, street, house, apartment",
    phonePlaceholder: "+7 ...",
    notesPlaceholder: "Packaging, fit or delivery notes",
    preorderDate: "Preorder date",
    linkedTryOn: "Linked try-on",
    placing: "Placing order...",
    confirm: "Confirm order",
    back: "Back",
    size: "Size",
  },
};

export default function CheckoutScreen() {
  const redirect = useRequireRole("client");
  const language = useAppStore((state) => state.language);
  const params = useLocalSearchParams<{
    id: string;
    variantId?: string;
    scheduledDate?: string;
    tryOnId?: string;
  }>();
  const products = useAppStore((state) => state.products);
  const orders = useAppStore((state) => state.orders);
  const user = useAppStore((state) => state.user);
  const placeOrder = useAppStore((state) => state.placeOrder);
  const copy = COPY[language];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("kaspi");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("courier");
  const [shippingAddress, setShippingAddress] = useState(user?.defaultShippingAddress ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingOrder = orders.find((item) => item.id === params.id) ?? null;
  const product = useMemo(
    () => products.find((item) => item.id === params.id) ?? null,
    [params.id, products],
  );

  useEffect(() => {
    if (deliveryMethod === "pickup") {
      setShippingAddress("Almaty flagship pickup point");
      return;
    }

    setShippingAddress(user?.defaultShippingAddress ?? "");
  }, [deliveryMethod, user?.defaultShippingAddress]);

  if (redirect) {
    return redirect;
  }

  const selectedVariant =
    product?.variants.find((variant) => variant.id === params.variantId) ?? product?.variants[0];

  const confirmationFields = existingOrder
    ? [
        { label: copy.status, value: existingOrder.status.replaceAll("_", " ").toUpperCase() },
        { label: copy.payment, value: existingOrder.paymentMethod.toUpperCase() },
        { label: copy.delivery, value: existingOrder.deliveryMethod.toUpperCase() },
        { label: copy.address, value: existingOrder.shippingAddress },
      ]
    : [];

  return (
    <ScreenShell
      title={copy.shellPayment}
      subtitle={existingOrder ? copy.shellConfirmation : product?.name ?? copy.shellPayment}
      profileRoute="/profile"
    >
      <CheckoutExperience
        language={language}
        copy={copy}
        existingOrder={existingOrder}
        product={product}
        selectedVariant={selectedVariant}
        paymentMethod={paymentMethod}
        deliveryMethod={deliveryMethod}
        shippingAddress={shippingAddress}
        contactPhone={contactPhone}
        notes={notes}
        isSubmitting={isSubmitting}
        scheduledDate={params.scheduledDate}
        tryOnId={params.tryOnId}
        confirmationFields={confirmationFields}
        onSetPaymentMethod={(value) => setPaymentMethod(value as PaymentMethod)}
        onSetDeliveryMethod={(value) => setDeliveryMethod(value as DeliveryMethod)}
        onSetShippingAddress={setShippingAddress}
        onSetContactPhone={setContactPhone}
        onSetNotes={setNotes}
        onConfirm={async () => {
          if (!product || !selectedVariant) {
            return;
          }

          setIsSubmitting(true);

          try {
            const order = await placeOrder({
              productId: product.id,
              variantId: selectedVariant.id,
              paymentMethod,
              deliveryMethod,
              shippingAddress,
              contactPhone,
              scheduledDate: params.scheduledDate,
              notes,
              tryOnId: params.tryOnId,
            });

            router.replace(`/client/checkout/${order.id}`);
          } finally {
            setIsSubmitting(false);
          }
        }}
        onBack={() => router.back()}
        onOpenProfile={() => router.push("/profile")}
        onBackToClient={() => router.replace("/client")}
      />
    </ScreenShell>
  );
}
