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
          ready: "Готово",
        },
      },
    },
    kk: {
      translation: {
        status: {
          pending_franchisee: "Жаңа тапсырыс",
          in_production: "Өндірісте",
          ready: "Дайын",
        },
      },
    },
    en: {
      translation: {
        status: {
          pending_franchisee: "New order",
          in_production: "In production",
          ready: "Ready",
        },
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
