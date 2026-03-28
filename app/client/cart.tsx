import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenShell } from "../../src/components/ScreenShell";
import { CartExperience } from "../../src/features/client/cart/CartExperience";
import { formatPrice } from "../../src/features/client/shared";
import { useRequireRole } from "../../src/lib/useRequireRole";
import { useAppStore } from "../../src/store/useAppStore";
import { AppLanguage, DeliveryMethod, PaymentMethod } from "../../src/types";

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    shellSubtitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    backToCatalog: string;
    cartTitle: string;
    cartSubtitle: string;
    payment: string;
    delivery: string;
    address: string;
    phone: string;
    notes: string;
    addressPlaceholder: string;
    phonePlaceholder: string;
    notesPlaceholder: string;
    remove: string;
    clear: string;
    minus: string;
    plus: string;
    size: string;
    qty: string;
    checkout: string;
    checkingOut: string;
    success: string;
    openProfile: string;
    total: string;
  }
> = {
  ru: {
    shellTitle: "Корзина",
    shellSubtitle: "SELECTION / DELIVERY / PAYMENT",
    emptyTitle: "Корзина пуста",
    emptySubtitle: "Добавь продукты из каталога, чтобы перейти в полноценный premium-checkout поток.",
    backToCatalog: "Вернуться в каталог",
    cartTitle: "Собранный checkout",
    cartSubtitle: "Корзина, доставка, оплата и контактные данные теперь собраны в один связный клиентский слой.",
    payment: "Способ оплаты",
    delivery: "Способ доставки",
    address: "Адрес",
    phone: "Телефон",
    notes: "Примечания",
    addressPlaceholder: "Город, улица, дом, квартира",
    phonePlaceholder: "+7 ...",
    notesPlaceholder: "Комментарий к упаковке, примерке или доставке",
    remove: "Удалить",
    clear: "Очистить корзину",
    minus: "−",
    plus: "+",
    size: "Размер",
    qty: "Количество",
    checkout: "Оформить заказ",
    checkingOut: "Оформление...",
    success: "Заказы созданы и уже переданы в live-операции",
    openProfile: "Открыть профиль",
    total: "Итого",
  },
  kk: {
    shellTitle: "Себет",
    shellSubtitle: "SELECTION / DELIVERY / PAYMENT",
    emptyTitle: "Себет бос",
    emptySubtitle: "Толық premium-checkout ағынына өту үшін каталогтан өнім қос.",
    backToCatalog: "Каталогқа қайту",
    cartTitle: "Жиналған checkout",
    cartSubtitle: "Себет, жеткізу, төлем және байланыс деректері бір тұтас клиенттік қабатқа біріктірілді.",
    payment: "Төлем тәсілі",
    delivery: "Жеткізу тәсілі",
    address: "Мекенжай",
    phone: "Телефон",
    notes: "Ескертпе",
    addressPlaceholder: "Қала, көше, үй, пәтер",
    phonePlaceholder: "+7 ...",
    notesPlaceholder: "Қаптама, fitting немесе жеткізу туралы түсініктеме",
    remove: "Өшіру",
    clear: "Себетті тазалау",
    minus: "−",
    plus: "+",
    size: "Өлшем",
    qty: "Саны",
    checkout: "Тапсырысты рәсімдеу",
    checkingOut: "Рәсімделуде...",
    success: "Тапсырыстар жасалып, live-операцияларға берілді",
    openProfile: "Профильді ашу",
    total: "Жалпы",
  },
  en: {
    shellTitle: "Cart",
    shellSubtitle: "SELECTION / DELIVERY / PAYMENT",
    emptyTitle: "Cart is empty",
    emptySubtitle: "Add products from the catalog to move into the full premium checkout flow.",
    backToCatalog: "Back to catalog",
    cartTitle: "Curated checkout",
    cartSubtitle: "Basket, delivery, payment and contact data now live in one coherent client layer.",
    payment: "Payment method",
    delivery: "Delivery method",
    address: "Address",
    phone: "Phone",
    notes: "Notes",
    addressPlaceholder: "City, street, house, apartment",
    phonePlaceholder: "+7 ...",
    notesPlaceholder: "Packaging, fitting or delivery notes",
    remove: "Remove",
    clear: "Clear cart",
    minus: "−",
    plus: "+",
    size: "Size",
    qty: "Quantity",
    checkout: "Place order",
    checkingOut: "Placing...",
    success: "Orders were created and routed into live operations",
    openProfile: "Open profile",
    total: "Total",
  },
};

export default function CartScreen() {
  const redirect = useRequireRole("client");
  const language = useAppStore((state) => state.language);
  const cartItems = useAppStore((state) => state.cartItems);
  const products = useAppStore((state) => state.products);
  const user = useAppStore((state) => state.user);
  const updateCartQuantity = useAppStore((state) => state.updateCartQuantity);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const clearCart = useAppStore((state) => state.clearCart);
  const placeOrder = useAppStore((state) => state.placeOrder);
  const copy = COPY[language];

  const insets = useSafeAreaInsets();
  const bottomNavPadding = Platform.OS === "web" ? 0 : insets.bottom + 80;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("kaspi");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("courier");
  const [shippingAddress, setShippingAddress] = useState(user?.defaultShippingAddress ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setShippingAddress(user?.defaultShippingAddress ?? "");
    setContactPhone(user?.phone ?? "");
  }, [user]);

  const cartLines = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          const variant = product?.variants.find((entry) => entry.id === item.variantId);

          if (!product || !variant) {
            return null;
          }

          return {
            id: item.id,
            product,
            variant,
            quantity: item.quantity,
            total: product.priceAmount * item.quantity,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [cartItems, products],
  );

  const totalAmount = cartLines.reduce((sum, entry) => sum + entry.total, 0);

  if (redirect) {
    return redirect;
  }

  return (
    <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle} profileRoute="/profile">
      <CartExperience
        language={language}
        copy={copy}
        user={user}
        cartLines={cartLines}
        paymentMethod={paymentMethod}
        deliveryMethod={deliveryMethod}
        shippingAddress={shippingAddress}
        contactPhone={contactPhone}
        notes={notes}
        isSubmitting={isSubmitting}
        successMessage={successMessage}
        totalAmount={totalAmount}
        bottomPadding={bottomNavPadding}
        onSetPaymentMethod={(value) => setPaymentMethod(value as PaymentMethod)}
        onSetDeliveryMethod={(value) => setDeliveryMethod(value as DeliveryMethod)}
        onSetShippingAddress={setShippingAddress}
        onSetContactPhone={setContactPhone}
        onSetNotes={setNotes}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onCheckout={async () => {
          setIsSubmitting(true);
          try {
            let createdCount = 0;

            for (const entry of cartLines) {
              for (let count = 0; count < entry.quantity; count += 1) {
                await placeOrder({
                  productId: entry.product.id,
                  variantId: entry.variant.id,
                  deliveryMethod,
                  paymentMethod,
                  shippingAddress,
                  contactPhone,
                  scheduledDate: cartItems.find((item) => item.id === entry.id)?.scheduledDate,
                  notes,
                  tryOnId: cartItems.find((item) => item.id === entry.id)?.tryOnId,
                });
                createdCount += 1;
              }
            }

            clearCart();
            setSuccessMessage(`${copy.success} / ${createdCount} / ${formatPrice(totalAmount, language)}`);
          } finally {
            setIsSubmitting(false);
          }
        }}
        onBackToCatalog={() => router.replace("/client")}
        onOpenProfile={() => router.push("/profile")}
      />
    </ScreenShell>
  );
}