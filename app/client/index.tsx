import { router } from "expo-router";
import { useMemo, useState } from "react";

import { ScreenShell } from "../../src/components/ScreenShell";
import { ClientHomeExperience } from "../../src/features/client/home/ClientHomeExperience";
import {
  buildCatalogSections,
  buildCollections,
  getCategoryLabel,
  getStyleLabel,
} from "../../src/features/client/shared";
import { useRequireRole } from "../../src/lib/useRequireRole";
import { useAppStore } from "../../src/store/useAppStore";
import { AppLanguage, ProductAvailability } from "../../src/types";

const COPY: Record<
  AppLanguage,
  {
    shellTitle: string;
    shellSubtitle: string;
    heroEyebrow: string;
    heroTitlePrefix: string;
    heroDescription: string;
    openProduct: string;
    openProfile: string;
    openCart: string;
    searchLabel: string;
    searchPlaceholder: string;
    categoryFilter: string;
    availabilityFilter: string;
    styleFilter: string;
    collectionsTitle: string;
    collectionsSubtitle: string;
    activeOrderTitle: string;
    activeOrderSubtitle: string;
    catalogTitle: string;
    catalogSubtitle: string;
    stockReady: string;
    stockPreorder: string;
    clearFilters: string;
    allCategories: string;
    allAvailability: string;
    allStyles: string;
    inStock: string;
    preorder: string;
    metricProducts: string;
    metricTryOns: string;
    metricLoyalty: string;
  }
> = {
  ru: {
    shellTitle: "Витрина",
    shellSubtitle: "PREMIUM CATALOG / STORY / TRY-ON / CHECKOUT",
    heroEyebrow: "COLLECTION 01 / PREMIUM MERCHANDISING",
    heroTitlePrefix: "Капсула сезона",
    heroDescription:
      "Новая клиентская часть строится как отдельный premium-commerce слой: сильный hero, curated sections, фильтры, story-led карточки и мобильный интерфейс без ощущения урезанной веб-копии.",
    openProduct: "Открыть продукт",
    openProfile: "Открыть профиль",
    openCart: "Открыть корзину",
    searchLabel: "Поиск по каталогу",
    searchPlaceholder: "Название, SKU, материал, силуэт",
    categoryFilter: "Категории",
    availabilityFilter: "Наличие",
    styleFilter: "Стиль",
    collectionsTitle: "Коллекции",
    collectionsSubtitle: "Каталог теперь собран не только по товарам, но и по цельным продуктовым направлениям.",
    activeOrderTitle: "Активный заказ",
    activeOrderSubtitle: "Клиент продолжает видеть живой operational-layer после действий франчайзи и производства.",
    catalogTitle: "Каталог",
    catalogSubtitle: "Секции витрины собраны как premium-merchandising система, а не просто список карточек.",
    stockReady: "Доступный stock",
    stockPreorder: "Режим preorder",
    clearFilters: "Сбросить фильтры",
    allCategories: "Все категории",
    allAvailability: "Любой статус",
    allStyles: "Все стили",
    inStock: "В наличии",
    preorder: "Предзаказ",
    metricProducts: "Продуктов",
    metricTryOns: "Try-on сессий",
    metricLoyalty: "Лояльность",
  },
  kk: {
    shellTitle: "Витрина",
    shellSubtitle: "PREMIUM CATALOG / STORY / TRY-ON / CHECKOUT",
    heroEyebrow: "COLLECTION 01 / PREMIUM MERCHANDISING",
    heroTitlePrefix: "Маусым капсуласы",
    heroDescription:
      "Жаңа клиенттік бөлік енді жеке premium-commerce қабаты ретінде құрылған: күшті hero, curated sections, фильтрлер, story-led карталар және вебтің қысқартылған көшірмесіне ұқсамайтын мобильді тәжірибе.",
    openProduct: "Өнімді ашу",
    openProfile: "Профильді ашу",
    openCart: "Себетті ашу",
    searchLabel: "Каталогтан іздеу",
    searchPlaceholder: "Атауы, SKU, материал, силуэт",
    categoryFilter: "Санаттар",
    availabilityFilter: "Қолжетімділік",
    styleFilter: "Стиль",
    collectionsTitle: "Топтамалар",
    collectionsSubtitle: "Каталог енді тек тауарлар бойынша емес, толық өнімдік бағыттар бойынша құрылған.",
    activeOrderTitle: "Белсенді тапсырыс",
    activeOrderSubtitle: "Клиент франчайзи мен өндіріс әрекеттерінен кейін де live operational-layer көреді.",
    catalogTitle: "Каталог",
    catalogSubtitle: "Витрина секциялары жай карточкалар тізімі емес, premium merchandising жүйесі ретінде жиналған.",
    stockReady: "Қолдағы stock",
    stockPreorder: "Preorder режимі",
    clearFilters: "Фильтрлерді тазалау",
    allCategories: "Барлық санат",
    allAvailability: "Кез келген статус",
    allStyles: "Барлық стиль",
    inStock: "Қолда бар",
    preorder: "Алдын ала тапсырыс",
    metricProducts: "Өнім",
    metricTryOns: "Try-on сессиясы",
    metricLoyalty: "Лоялдылық",
  },
  en: {
    shellTitle: "Vitrina",
    shellSubtitle: "PREMIUM CATALOG / STORY / TRY-ON / CHECKOUT",
    heroEyebrow: "COLLECTION 01 / PREMIUM MERCHANDISING",
    heroTitlePrefix: "Season capsule",
    heroDescription:
      "The client layer now behaves like a dedicated premium-commerce system: stronger hero storytelling, curated sections, filters, editorial cards and a mobile UI that is not just a compressed web clone.",
    openProduct: "Open product",
    openProfile: "Open profile",
    openCart: "Open cart",
    searchLabel: "Catalog search",
    searchPlaceholder: "Name, SKU, material, silhouette",
    categoryFilter: "Categories",
    availabilityFilter: "Availability",
    styleFilter: "Style",
    collectionsTitle: "Collections",
    collectionsSubtitle: "The catalog is now curated as product directions, not just a flat list of items.",
    activeOrderTitle: "Active order",
    activeOrderSubtitle: "The client still sees the live operational layer after franchisee and production actions.",
    catalogTitle: "Catalog",
    catalogSubtitle: "Each storefront section behaves like a premium merchandising rail, not a generic grid.",
    stockReady: "Ready stock",
    stockPreorder: "Preorder mode",
    clearFilters: "Reset filters",
    allCategories: "All categories",
    allAvailability: "Any status",
    allStyles: "All styles",
    inStock: "In stock",
    preorder: "Preorder",
    metricProducts: "Products",
    metricTryOns: "Try-on sessions",
    metricLoyalty: "Loyalty",
  },
};

export default function ClientScreen() {
  const redirect = useRequireRole("client");
  const language = useAppStore((state) => state.language);
  const categories = useAppStore((state) => state.categories);
  const products = useAppStore((state) => state.products);
  const activeOrder = useAppStore((state) => state.activeOrder);
  const tryOnSessions = useAppStore((state) => state.tryOnSessions);
  const user = useAppStore((state) => state.user);
  const cartItems = useAppStore((state) => state.cartItems);
  const copy = COPY[language];

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<"all" | ProductAvailability>("all");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const styleOptions = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.style))),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.subtitle.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      const matchesCategory = !selectedCategoryId || product.categoryId === selectedCategoryId;
      const matchesAvailability =
        selectedAvailability === "all" || product.availability === selectedAvailability;
      const matchesStyle = !selectedStyle || product.style.includes(selectedStyle);

      return matchesQuery && matchesCategory && matchesAvailability && matchesStyle;
    });
  }, [products, searchValue, selectedCategoryId, selectedAvailability, selectedStyle]);

  const effectiveProducts = filteredProducts.length ? filteredProducts : products;
  const featuredProduct = effectiveProducts.find((product) => product.featured) ?? effectiveProducts[0];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const collections = useMemo(
    () => buildCollections(categories, effectiveProducts, language),
    [categories, effectiveProducts, language],
  );
  const sections = useMemo(
    () => buildCatalogSections(effectiveProducts, language),
    [effectiveProducts, language],
  );

  if (redirect) {
    return redirect;
  }

  return (
    <ScreenShell title={copy.shellTitle} subtitle={copy.shellSubtitle} profileRoute="/profile">
      <ClientHomeExperience
        language={language}
        copy={copy}
        featuredProduct={featuredProduct}
        metrics={[
          { label: copy.metricProducts, value: `${effectiveProducts.length}` },
          { label: copy.metricTryOns, value: `${tryOnSessions.length}` },
          { label: copy.metricLoyalty, value: `${user?.loyaltyProgress ?? 0}%` },
        ]}
        cartCount={cartCount}
        activeOrder={activeOrder}
        categoryChips={[
          {
            id: "all",
            label: copy.allCategories,
            active: selectedCategoryId === null,
            onPress: () => setSelectedCategoryId(null),
          },
          ...categories.map((category) => ({
            id: category.id,
            label: getCategoryLabel(category, language),
            active: selectedCategoryId === category.id,
            onPress: () => setSelectedCategoryId(category.id),
          })),
        ]}
        availabilityChips={[
          {
            id: "all",
            label: copy.allAvailability,
            active: selectedAvailability === "all",
            onPress: () => setSelectedAvailability("all"),
          },
          {
            id: "in_stock",
            label: copy.inStock,
            active: selectedAvailability === "in_stock",
            onPress: () => setSelectedAvailability("in_stock"),
          },
          {
            id: "preorder",
            label: copy.preorder,
            active: selectedAvailability === "preorder",
            onPress: () => setSelectedAvailability("preorder"),
          },
        ]}
        styleChips={[
          {
            id: "all",
            label: copy.allStyles,
            active: selectedStyle === null,
            onPress: () => setSelectedStyle(null),
          },
          ...styleOptions.map((style) => ({
            id: style,
            label: getStyleLabel(style, language),
            active: selectedStyle === style,
            onPress: () => setSelectedStyle(style),
          })),
        ]}
        collections={collections}
        sections={sections}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onOpenProduct={(productId) => router.push(`/client/product/${productId}`)}
        onOpenProfile={() => router.push("/profile")}
        onOpenCart={() => router.push("/client/cart")}
        onClearFilters={() => {
          setSearchValue("");
          setSelectedCategoryId(null);
          setSelectedAvailability("all");
          setSelectedStyle(null);
        }}
      />
    </ScreenShell>
  );
}
