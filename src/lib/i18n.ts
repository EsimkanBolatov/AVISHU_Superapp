import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const detectedLanguage = Localization.getLocales()[0]?.languageCode ?? "ru";
const initialLanguage = ["ru", "kk", "en"].includes(detectedLanguage) ? detectedLanguage : "ru";

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: initialLanguage,
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
          cancelled: "Отменено",
          return_requested: "Запрошен возврат",
          exchange_requested: "Запрошен обмен",
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
          cancelled: "Тоқтатылды",
          return_requested: "Қайтарым сұралды",
          exchange_requested: "Айырбас сұралды",
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
          cancelled: "Cancelled",
          return_requested: "Return requested",
          exchange_requested: "Exchange requested",
        },
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
