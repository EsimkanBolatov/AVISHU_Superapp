import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { ScreenShell } from "../../../src/components/ScreenShell";
import { ProductDetailExperience } from "../../../src/features/client/product/ProductDetailExperience";
import { getStyleLabel } from "../../../src/features/client/shared";
import { useRequireRole } from "../../../src/lib/useRequireRole";
import { useAppStore } from "../../../src/store/useAppStore";
import { AppLanguage } from "../../../src/types";

const DELIVERY_OPTIONS = ["2026-04-02", "2026-04-05", "2026-04-09"];

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    sku: string;
    category: string;
    composition: string;
    fitNotes: string;
    delivery: string;
    style: string;
    care: string;
    sizeGuide: string;
    editorialStory: string;
    relatedLooks: string;
    crossSell: string;
    favorite: string;
    unfavorite: string;
    sizeSelection: string;
    selectDelivery: string;
    gallery: string;
    tryOnTitle: string;
    tryOnSubtitle: string;
    sourceImage: string;
    sourceImagePlaceholder: string;
    tryOnHistory: string;
    generate: string;
    generating: string;
    ready: string;
    preorder: string;
    addToCart: string;
    continue: string;
    back: string;
    cart: string;
  }
> = {
  ru: {
    shellTitle: "Продукт",
    sku: "SKU",
    category: "Категория",
    composition: "Состав",
    fitNotes: "Посадка",
    delivery: "Доставка",
    style: "Стиль / stock",
    care: "Уход",
    sizeGuide: "Гид по размеру",
    editorialStory: "Editorial story",
    relatedLooks: "Related looks",
    crossSell: "Cross-sell",
    favorite: "В избранное",
    unfavorite: "Убрать из избранного",
    sizeSelection: "Выбор размера",
    selectDelivery: "Окно доставки",
    gallery: "LOOK",
    tryOnTitle: "AI try-on pipeline",
    tryOnSubtitle: "Сохрани примерку и свяжи ее с корзиной и checkout.",
    sourceImage: "Ссылка на фото",
    sourceImagePlaceholder: "https://...",
    tryOnHistory: "История try-on",
    generate: "Создать try-on",
    generating: "Генерация...",
    ready: "Готово к отправке",
    preorder: "Предзаказ",
    addToCart: "В корзину",
    continue: "К checkout",
    back: "Назад",
    cart: "Открыть корзину",
  },
  kk: {
    shellTitle: "Өнім",
    sku: "SKU",
    category: "Санат",
    composition: "Құрамы",
    fitNotes: "Отырымы",
    delivery: "Жеткізу",
    style: "Стиль / stock",
    care: "Күтім",
    sizeGuide: "Өлшем гиді",
    editorialStory: "Editorial story",
    relatedLooks: "Related looks",
    crossSell: "Cross-sell",
    favorite: "Таңдалғанға қосу",
    unfavorite: "Таңдалғаннан алып тастау",
    sizeSelection: "Өлшем таңдау",
    selectDelivery: "Жеткізу уақыты",
    gallery: "LOOK",
    tryOnTitle: "AI try-on pipeline",
    tryOnSubtitle: "Preview жасап, оны себет пен checkout ағымына байланыстыр.",
    sourceImage: "Фото сілтемесі",
    sourceImagePlaceholder: "https://...",
    tryOnHistory: "Try-on тарихы",
    generate: "Try-on жасау",
    generating: "Жасалуда...",
    ready: "Жөнелтуге дайын",
    preorder: "Алдын ала тапсырыс",
    addToCart: "Себетке қосу",
    continue: "Checkout-қа өту",
    back: "Артқа",
    cart: "Себетті ашу",
  },
  en: {
    shellTitle: "Product",
    sku: "SKU",
    category: "Category",
    composition: "Composition",
    fitNotes: "Fit notes",
    delivery: "Delivery",
    style: "Style / stock",
    care: "Care instructions",
    sizeGuide: "Size guide",
    editorialStory: "Editorial story",
    relatedLooks: "Related looks",
    crossSell: "Cross-sell",
    favorite: "Save to favorites",
    unfavorite: "Remove favorite",
    sizeSelection: "Size selection",
    selectDelivery: "Select delivery window",
    gallery: "LOOK",
    tryOnTitle: "AI try-on pipeline",
    tryOnSubtitle: "Save a preview so it can travel into cart and checkout.",
    sourceImage: "Source image URL",
    sourceImagePlaceholder: "https://...",
    tryOnHistory: "Try-on history",
    generate: "Create try-on",
    generating: "Generating...",
    ready: "Ready to ship",
    preorder: "Preorder piece",
    addToCart: "Add to cart",
    continue: "Continue to checkout",
    back: "Back",
    cart: "Open cart",
  },
};

export default function ProductDetailScreen() {
  const redirect = useRequireRole("client");
  const router = useRouter();
  const language = useAppStore((state) => state.language);
  const params = useLocalSearchParams<{ id: string }>();
  const products = useAppStore((state) => state.products);
  const createTryOn = useAppStore((state) => state.createTryOn);
  const tryOnSessions = useAppStore((state) => state.tryOnSessions);
  const addToCart = useAppStore((state) => state.addToCart);
  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const trackProductView = useAppStore((state) => state.trackProductView);
  const copy = COPY[language];

  const [selectedDate, setSelectedDate] = useState(DELIVERY_OPTIONS[0]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [photoUrl, setPhotoUrl] = useState("");
  const [submittingTryOn, setSubmittingTryOn] = useState(false);
  const [selectedTryOnId, setSelectedTryOnId] = useState<string | null>(null);

  const product = useMemo(
    () => products.find((item) => item.id === params.id) ?? products[0],
    [params.id, products],
  );

  const productTryOns = useMemo(
    () => tryOnSessions.filter((session) => session.productId === product?.id),
    [product?.id, tryOnSessions],
  );

  const isFavorite = Boolean(product && favorites.some((favorite) => favorite.productId === product.id));
  const relatedProducts = useMemo(
    () =>
      (product?.relatedProductIds ?? [])
        .map((id) => products.find((item) => item.id === id))
        .filter((item): item is (typeof products)[number] => Boolean(item))
        .slice(0, 4),
    [product?.relatedProductIds, products],
  );
  const crossSellProducts = useMemo(
    () =>
      (product?.crossSellProductIds ?? [])
        .map((id) => products.find((item) => item.id === id))
        .filter((item): item is (typeof products)[number] => Boolean(item))
        .slice(0, 4),
    [product?.crossSellProductIds, products],
  );

  useEffect(() => {
    if (!product) {
      return;
    }

    void trackProductView(product.id);
  }, [product, trackProductView]);

  if (redirect) {
    return redirect;
  }

  if (!product) {
    return null;
  }

  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];

  return (
    <ScreenShell title={copy.shellTitle} subtitle={product.name} profileRoute="/profile">
      <ProductDetailExperience
        language={language}
        copy={copy}
        product={product}
        activeMediaUrl={product.media[activeMediaIndex]?.url}
        activeMediaAlt={product.media[activeMediaIndex]?.alt}
        activeMediaIndex={activeMediaIndex}
        deliveryOptions={DELIVERY_OPTIONS}
        selectedDate={selectedDate}
        selectedVariant={selectedVariant}
        selectedTryOnId={selectedTryOnId}
        photoUrl={photoUrl}
        submittingTryOn={submittingTryOn}
        productTryOns={productTryOns}
        styleLabels={product.style.map((style) => getStyleLabel(style, language))}
        isFavorite={isFavorite}
        relatedProducts={relatedProducts}
        crossSellProducts={crossSellProducts}
        onSelectMedia={setActiveMediaIndex}
        onSelectVariant={setSelectedVariantId}
        onSelectDate={setSelectedDate}
        onSelectTryOn={setSelectedTryOnId}
        onPhotoUrlChange={setPhotoUrl}
        onCreateTryOn={async () => {
          if (!photoUrl.trim()) {
            return;
          }

          setSubmittingTryOn(true);

          try {
            const tryOn = await createTryOn({
              productId: product.id,
              sourceImageUrl: photoUrl.trim(),
              notes: `Generated for ${product.name}.`,
            });

            setSelectedTryOnId(tryOn.id);
            setPhotoUrl("");
          } finally {
            setSubmittingTryOn(false);
          }
        }}
        onToggleFavorite={async () => {
          await toggleFavorite(product.id);
        }}
        onOpenProduct={(productId) => router.push(`/client/product/${productId}`)}
        onAddToCart={() => {
          if (!selectedVariant) {
            return;
          }

          addToCart({
            productId: product.id,
            variantId: selectedVariant.id,
            scheduledDate: product.availability === "preorder" ? selectedDate : undefined,
            tryOnId: selectedTryOnId ?? undefined,
          });
        }}
        onContinue={() => {
          if (!selectedVariant) {
            return;
          }

          router.push({
            pathname: `/client/checkout/${product.id}`,
            params: {
              variantId: selectedVariant.id,
              scheduledDate: product.availability === "preorder" ? selectedDate : undefined,
              tryOnId: selectedTryOnId ?? undefined,
            },
          });
        }}
        onOpenCart={() => router.push("/client/cart")}
        onBack={() => router.back()}
      />
    </ScreenShell>
  );
}
