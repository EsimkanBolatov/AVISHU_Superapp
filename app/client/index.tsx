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
    brandFilter: string;
    materialFilter: string;
    fitFilter: string;
    priceFilter: string;
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
    allBrands: string;
    allMaterials: string;
    allFits: string;
    allPrices: string;
    inStock: string;
    preorder: string;
    metricProducts: string;
    metricTryOns: string;
    metricLoyalty: string;
    under100: string;
    midPrice: string;
    premium: string;
  }
> = {
  ru: {
    shellTitle: "Витрина",
    shellSubtitle: "PREMIUM CATALOG / STORY / TRY-ON / CHECKOUT",
    heroEyebrow: "COLLECTION 01 / PREMIUM MERCHANDISING",
    heroTitlePrefix: "Капсула сезона",
    heroDescription: "Каталог работает как premium-commerce слой: editorial hero, фасеты, curated sections и мобильный сценарий без ощущения сжатой web-копии.",
    openProduct: "Открыть продукт",
    openProfile: "Открыть профиль",
    openCart: "Открыть корзину",
    searchLabel: "Поиск по каталогу",
    searchPlaceholder: "Название, SKU, материал, бренд",
    categoryFilter: "Категории",
    availabilityFilter: "Наличие",
    styleFilter: "Стиль",
    brandFilter: "Бренды",
    materialFilter: "Материалы",
    fitFilter: "Посадка",
    priceFilter: "Цена",
    collectionsTitle: "Коллекции",
    collectionsSubtitle: "Каталог собран не только по SKU, но и по product directions, drop logic и seasonal storytelling.",
    activeOrderTitle: "Активный заказ",
    activeOrderSubtitle: "Клиент видит live-операции после действий franchisee, production и support.",
    catalogTitle: "Каталог",
    catalogSubtitle: "Фасеты теперь охватывают brand, fit, materials, price и availability для premium-магазина.",
    stockReady: "Доступный stock",
    stockPreorder: "Режим preorder",
    clearFilters: "Сбросить фильтры",
    allCategories: "Все категории",
    allAvailability: "Любой статус",
    allStyles: "Все стили",
    allBrands: "Все бренды",
    allMaterials: "Все материалы",
    allFits: "Любая посадка",
    allPrices: "Любая цена",
    inStock: "В наличии",
    preorder: "Предзаказ",
    metricProducts: "Продуктов",
    metricTryOns: "Try-on сессий",
    metricLoyalty: "Лояльность",
    under100: "До 100k",
    midPrice: "100k - 180k",
    premium: "180k+",
  },
  kk: {
    shellTitle: "Витрина",
    shellSubtitle: "PREMIUM CATALOG / STORY / TRY-ON / CHECKOUT",
    heroEyebrow: "COLLECTION 01 / PREMIUM MERCHANDISING",
    heroTitlePrefix: "Маусым капсуласы",
    heroDescription: "Каталог premium-commerce қабаты сияқты жұмыс істейді: editorial hero, фасеттер, curated sections және web көшірмесіне ұқсамайтын mobile сценарий.",
    openProduct: "Өнімді ашу",
    openProfile: "Профильді ашу",
    openCart: "Себетті ашу",
    searchLabel: "Каталогтан іздеу",
    searchPlaceholder: "Атауы, SKU, материал, бренд",
    categoryFilter: "Санаттар",
    availabilityFilter: "Қолжетімділік",
    styleFilter: "Стиль",
    brandFilter: "Брендтер",
    materialFilter: "Материалдар",
    fitFilter: "Отырымы",
    priceFilter: "Баға",
    collectionsTitle: "Коллекциялар",
    collectionsSubtitle: "Каталог енді SKU ғана емес, product direction, drop logic және seasonal storytelling бойынша құрылған.",
    activeOrderTitle: "Белсенді тапсырыс",
    activeOrderSubtitle: "Клиент franchisee, production және support әрекеттерінен кейін live-операцияны көреді.",
    catalogTitle: "Каталог",
    catalogSubtitle: "Фасеттер енді brand, fit, materials, price және availability бағыттарын қамтиды.",
    stockReady: "Қолдағы stock",
    stockPreorder: "Preorder режимі",
    clearFilters: "Фильтрлерді тазалау",
    allCategories: "Барлық санат",
    allAvailability: "Кез келген статус",
    allStyles: "Барлық стиль",
    allBrands: "Барлық бренд",
    allMaterials: "Барлық материал",
    allFits: "Кез келген fit",
    allPrices: "Кез келген баға",
    inStock: "Қолда бар",
    preorder: "Алдын ала тапсырыс",
    metricProducts: "Өнім",
    metricTryOns: "Try-on сессиясы",
    metricLoyalty: "Лоялдылық",
    under100: "100k дейін",
    midPrice: "100k - 180k",
    premium: "180k+",
  },
  en: {
    shellTitle: "Vitrina",
    shellSubtitle: "PREMIUM CATALOG / STORY / TRY-ON / CHECKOUT",
    heroEyebrow: "COLLECTION 01 / PREMIUM MERCHANDISING",
    heroTitlePrefix: "Season capsule",
    heroDescription: "The catalog behaves like a premium-commerce layer: editorial hero, full facets, curated sections and a mobile scenario that is not a compressed web clone.",
    openProduct: "Open product",
    openProfile: "Open profile",
    openCart: "Open cart",
    searchLabel: "Catalog search",
    searchPlaceholder: "Name, SKU, material, brand",
    categoryFilter: "Categories",
    availabilityFilter: "Availability",
    styleFilter: "Style",
    brandFilter: "Brands",
    materialFilter: "Materials",
    fitFilter: "Fit",
    priceFilter: "Price",
    collectionsTitle: "Collections",
    collectionsSubtitle: "The catalog is now organized by product directions, drop logic and seasonal storytelling, not just flat SKU rows.",
    activeOrderTitle: "Active order",
    activeOrderSubtitle: "The client sees live operations after franchisee, production and support actions.",
    catalogTitle: "Catalog",
    catalogSubtitle: "Facets now cover brand, fit, materials, price and availability for a true premium store flow.",
    stockReady: "Ready stock",
    stockPreorder: "Preorder mode",
    clearFilters: "Reset filters",
    allCategories: "All categories",
    allAvailability: "Any status",
    allStyles: "All styles",
    allBrands: "All brands",
    allMaterials: "All materials",
    allFits: "Any fit",
    allPrices: "Any price",
    inStock: "In stock",
    preorder: "Preorder",
    metricProducts: "Products",
    metricTryOns: "Try-on sessions",
    metricLoyalty: "Loyalty",
    under100: "Under 100k",
    midPrice: "100k - 180k",
    premium: "180k+",
  },
};

type PriceFilter = "all" | "under-100" | "mid" | "premium";

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
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedFit, setSelectedFit] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<PriceFilter>("all");

  const styleOptions = useMemo(() => Array.from(new Set(products.flatMap((product) => product.style))), [products]);
  const brandOptions = useMemo(() => Array.from(new Set(products.map((product) => product.brandName))), [products]);
  const materialOptions = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.materials))).slice(0, 8),
    [products],
  );
  const fitOptions = useMemo(() => Array.from(new Set(products.map((product) => product.fitProfile))), [products]);

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.subtitle.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.brandName.toLowerCase().includes(query);
      const matchesCategory = !selectedCategoryId || product.categoryId === selectedCategoryId;
      const matchesAvailability = selectedAvailability === "all" || product.availability === selectedAvailability;
      const matchesStyle = !selectedStyle || product.style.includes(selectedStyle);
      const matchesBrand = !selectedBrand || product.brandName === selectedBrand;
      const matchesMaterial = !selectedMaterial || product.materials.includes(selectedMaterial);
      const matchesFit = !selectedFit || product.fitProfile === selectedFit;
      const matchesPrice =
        selectedPrice === "all" ||
        (selectedPrice === "under-100" && product.priceAmount < 100000) ||
        (selectedPrice === "mid" && product.priceAmount >= 100000 && product.priceAmount < 180000) ||
        (selectedPrice === "premium" && product.priceAmount >= 180000);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesAvailability &&
        matchesStyle &&
        matchesBrand &&
        matchesMaterial &&
        matchesFit &&
        matchesPrice
      );
    });
  }, [
    products,
    searchValue,
    selectedCategoryId,
    selectedAvailability,
    selectedStyle,
    selectedBrand,
    selectedMaterial,
    selectedFit,
    selectedPrice,
  ]);

  const effectiveProducts = filteredProducts.length ? filteredProducts : products;
  const featuredProduct = effectiveProducts.find((product) => product.featured) ?? effectiveProducts[0];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const collections = useMemo(() => buildCollections(categories, effectiveProducts, language), [categories, effectiveProducts, language]);
  const sections = useMemo(() => buildCatalogSections(effectiveProducts, language), [effectiveProducts, language]);

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
          { id: "all", label: copy.allCategories, active: selectedCategoryId === null, onPress: () => setSelectedCategoryId(null) },
          ...categories.map((category) => ({
            id: category.id,
            label: getCategoryLabel(category, language),
            active: selectedCategoryId === category.id,
            onPress: () => setSelectedCategoryId(category.id),
          })),
        ]}
        availabilityChips={[
          { id: "all", label: copy.allAvailability, active: selectedAvailability === "all", onPress: () => setSelectedAvailability("all") },
          { id: "in_stock", label: copy.inStock, active: selectedAvailability === "in_stock", onPress: () => setSelectedAvailability("in_stock") },
          { id: "preorder", label: copy.preorder, active: selectedAvailability === "preorder", onPress: () => setSelectedAvailability("preorder") },
        ]}
        styleChips={[
          { id: "all", label: copy.allStyles, active: selectedStyle === null, onPress: () => setSelectedStyle(null) },
          ...styleOptions.map((style) => ({
            id: style,
            label: getStyleLabel(style, language),
            active: selectedStyle === style,
            onPress: () => setSelectedStyle(style),
          })),
        ]}
        brandChips={[
          { id: "all", label: copy.allBrands, active: selectedBrand === null, onPress: () => setSelectedBrand(null) },
          ...brandOptions.map((brand) => ({
            id: brand,
            label: brand,
            active: selectedBrand === brand,
            onPress: () => setSelectedBrand(brand),
          })),
        ]}
        materialChips={[
          { id: "all", label: copy.allMaterials, active: selectedMaterial === null, onPress: () => setSelectedMaterial(null) },
          ...materialOptions.map((material) => ({
            id: material,
            label: material,
            active: selectedMaterial === material,
            onPress: () => setSelectedMaterial(material),
          })),
        ]}
        fitChips={[
          { id: "all", label: copy.allFits, active: selectedFit === null, onPress: () => setSelectedFit(null) },
          ...fitOptions.map((fit) => ({
            id: fit,
            label: fit,
            active: selectedFit === fit,
            onPress: () => setSelectedFit(fit),
          })),
        ]}
        priceChips={[
          { id: "all", label: copy.allPrices, active: selectedPrice === "all", onPress: () => setSelectedPrice("all") },
          { id: "under-100", label: copy.under100, active: selectedPrice === "under-100", onPress: () => setSelectedPrice("under-100") },
          { id: "mid", label: copy.midPrice, active: selectedPrice === "mid", onPress: () => setSelectedPrice("mid") },
          { id: "premium", label: copy.premium, active: selectedPrice === "premium", onPress: () => setSelectedPrice("premium") },
        ]}
        collections={collections}
        sections={sections}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onOpenCollection={(collectionId) => router.push(`/client/collection/${collectionId}`)}
        onOpenProduct={(productId) => router.push(`/client/product/${productId}`)}
        onOpenProfile={() => router.push("/profile")}
        onOpenCart={() => router.push("/client/cart")}
        onClearFilters={() => {
          setSearchValue("");
          setSelectedCategoryId(null);
          setSelectedAvailability("all");
          setSelectedStyle(null);
          setSelectedBrand(null);
          setSelectedMaterial(null);
          setSelectedFit(null);
          setSelectedPrice("all");
        }}
      />
    </ScreenShell>
  );
}
