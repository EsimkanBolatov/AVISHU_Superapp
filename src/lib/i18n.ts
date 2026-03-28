import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const defaultLanguage = Localization.getLocales()[0]?.languageCode ?? "ru";

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: ["ru", "kk", "en"].includes(defaultLanguage) ? defaultLanguage : "ru",
  fallbackLng: "ru",
  resources: {
    ru: {
      translation: {
        status: {
          pending_franchisee: "Новый заказ",
          in_production: "В производстве",
          quality_check: "Контроль качества",
          ready: "Готово",
          delivered: "Доставлено",
        },
      },
    },
    kk: {
      translation: {
        status: {
          pending_franchisee: "Жаңа тапсырыс",
          in_production: "Өндірісте",
          quality_check: "Сапа бақылауы",
          ready: "Дайын",
          delivered: "Жеткізілді",
        },
      },
    },
    en: {
      translation: {
        status: {
          pending_franchisee: "New order",
          in_production: "In production",
          quality_check: "Quality check",
          ready: "Ready",
          delivered: "Delivered",
        },
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
