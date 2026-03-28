import { ImageSourcePropType } from "react-native";

import { referenceTechJacket } from "../../lib/brandArt";
import { AppLanguage, Category, Product } from "../../types";
import { CatalogCollectionVm, CatalogSectionVm } from "./view-models";

const LOCALES: Record<AppLanguage, string> = {
  ru: "ru-RU",
  kk: "kk-KZ",
  en: "en-US",
};

const CATEGORY_LABELS: Record<string, Record<AppLanguage, string>> = {
  outerwear: {
    ru: "Верхняя одежда",
    kk: "Сырт киім",
    en: "Outerwear",
  },
  tailoring: {
    ru: "Тейлоринг",
    kk: "Тігін архитектурасы",
    en: "Tailoring",
  },
  softwear: {
    ru: "Базовый слой",
    kk: "Жұмсақ қабат",
    en: "Softwear",
  },
};

const CATEGORY_DESCRIPTIONS: Record<string, Record<AppLanguage, string>> = {
  outerwear: {
    ru: "Технические силуэты, штормовые оболочки и защитная капсула для города.",
    kk: "Қалаға арналған техникалық силуэттер, шторм қабықтары және қорғаныс капсуласы.",
    en: "Technical silhouettes, storm shells and a weather-protected city capsule.",
  },
  tailoring: {
    ru: "Сдержанный тейлоринг с архитектурной посадкой и строгим ритмом линий.",
    kk: "Сәулеттік қонымы және нақты сызық ырғағы бар ұстамды тейлоринг.",
    en: "Restrained tailoring with architectural balance and sharper line rhythm.",
  },
  softwear: {
    ru: "Мягкие слои для многослойного гардероба и премиальной повседневности.",
    kk: "Көпқабатты гардероб пен премиум күнделікті стильге арналған жұмсақ қабаттар.",
    en: "Softer layers for premium everyday dressing and quieter wardrobe depth.",
  },
};

const STYLE_LABELS: Record<string, Record<AppLanguage, string>> = {
  technical: {
    ru: "Технический",
    kk: "Техникалық",
    en: "Technical",
  },
  outerwear: {
    ru: "Outerwear",
    kk: "Outerwear",
    en: "Outerwear",
  },
  monochrome: {
    ru: "Монохром",
    kk: "Монохром",
    en: "Monochrome",
  },
  tailored: {
    ru: "Тейлоринг",
    kk: "Тейлоринг",
    en: "Tailored",
  },
  city: {
    ru: "Город",
    kk: "Қала",
    en: "City",
  },
  tailoring: {
    ru: "Точная форма",
    kk: "Нақты форма",
    en: "Precision tailoring",
  },
  formal: {
    ru: "Формальный",
    kk: "Формалды",
    en: "Formal",
  },
  minimal: {
    ru: "Минимализм",
    kk: "Минимализм",
    en: "Minimal",
  },
  softwear: {
    ru: "Мягкий слой",
    kk: "Жұмсақ қабат",
    en: "Softwear",
  },
  layering: {
    ru: "Многослойность",
    kk: "Қабаттау",
    en: "Layering",
  },
};

export function getLocale(language: AppLanguage) {
  return LOCALES[language];
}

export function getProductImageSource(product?: Product, index = 0): ImageSourcePropType {
  const media = product?.media[index]?.url ?? product?.media[0]?.url;
  return media ? { uri: media } : referenceTechJacket;
}

export function getProductStock(product: Product) {
  return product.variants.reduce((sum, variant) => sum + Math.max(variant.stock - variant.reserved, 0), 0);
}

export function getCategoryLabel(category: Category, language: AppLanguage) {
  return CATEGORY_LABELS[category.slug]?.[language] ?? category.name;
}

export function getCategoryDescription(category: Category, language: AppLanguage) {
  return CATEGORY_DESCRIPTIONS[category.slug]?.[language] ?? category.description;
}

export function getStyleLabel(style: string, language: AppLanguage) {
  return STYLE_LABELS[style]?.[language] ?? style.toUpperCase();
}

export function formatPrice(value: number, language: AppLanguage) {
  return `${new Intl.NumberFormat(getLocale(language)).format(value)} ₸`;
}

export function formatDate(value: string, language: AppLanguage) {
  return new Date(value).toLocaleDateString(getLocale(language), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function buildCollections(
  categories: Category[],
  products: Product[],
  language: AppLanguage,
): CatalogCollectionVm[] {
  return categories.map((category) => {
    const categoryProducts = products.filter((product) => product.categoryId === category.id);
    return {
      id: category.id,
      title: getCategoryLabel(category, language),
      description: getCategoryDescription(category, language),
      countLabel: `${categoryProducts.length}`,
      coverUrl: categoryProducts[0]?.media[0]?.url,
    };
  });
}

export function buildCatalogSections(
  products: Product[],
  language: AppLanguage,
): CatalogSectionVm[] {
  const featured = products.filter((product) => product.featured);
  const ready = products.filter((product) => product.availability === "in_stock");
  const preorder = products.filter((product) => product.availability === "preorder");
  const editorial = products.filter((product) =>
    product.style.some((style) => ["technical", "minimal", "tailored", "layering"].includes(style)),
  );

  const copy = {
    newArrivals: {
      title: {
        ru: "Новые поступления",
        kk: "Жаңа келім",
        en: "New arrivals",
      },
      subtitle: {
        ru: "Главные позиции дропа с готовым размерным рядом и быстрой отгрузкой.",
        kk: "Өлшем қатары дайын және тез жөнелтілетін дроп позициялары.",
        en: "Core drop pieces with ready sizing and faster dispatch.",
      },
    },
    ready: {
      title: {
        ru: "Готово к отправке",
        kk: "Жөнелтуге дайын",
        en: "Ready to ship",
      },
      subtitle: {
        ru: "Модели, которые можно оформить без ожидания производства.",
        kk: "Өндірісті күтпей рәсімдеуге болатын модельдер.",
        en: "Pieces that can move without waiting for production.",
      },
    },
    preorder: {
      title: {
        ru: "Made to request",
        kk: "Сұраныс бойынша",
        en: "Made to request",
      },
      subtitle: {
        ru: "Предзаказ и персональный слот производства для более редких позиций.",
        kk: "Сирек позициялар үшін алдын ала тапсырыс және жеке өндіріс слоты.",
        en: "Preorder and allocated production slots for rarer silhouettes.",
      },
    },
    editorial: {
      title: {
        ru: "Editorial curation",
        kk: "Editorial топтама",
        en: "Editorial curation",
      },
      subtitle: {
        ru: "Собранный слой для более точного премиального сторителлинга в каталоге.",
        kk: "Каталогтағы дәлірек премиум сторителлингке арналған жинақталған қабат.",
        en: "A curated layer for tighter premium storytelling inside the catalog.",
      },
    },
  };

  return [
    {
      id: "new-arrivals",
      title: copy.newArrivals.title[language],
      subtitle: copy.newArrivals.subtitle[language],
      products: (featured.length ? featured : products).slice(0, 3),
    },
    {
      id: "ready",
      title: copy.ready.title[language],
      subtitle: copy.ready.subtitle[language],
      products: ready.slice(0, 4),
    },
    {
      id: "preorder",
      title: copy.preorder.title[language],
      subtitle: copy.preorder.subtitle[language],
      products: preorder.slice(0, 4),
    },
    {
      id: "editorial",
      title: copy.editorial.title[language],
      subtitle: copy.editorial.subtitle[language],
      products: (editorial.length ? editorial : products).slice(0, 4),
    },
  ].filter((section) => section.products.length > 0);
}
