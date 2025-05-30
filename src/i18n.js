import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';

// the translations
// (tip: move them in a JSON file and import them,
// but for now we keep it here for simplicity)
const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Overview of your store's performance and recent activity": "Overview of your store's performance and recent activity",
      "Total Revenue": "Total Revenue",
      "Total Orders": "Total Orders",
      "Total Customers": "Total Customers",
      "Average Order": "Average Order",
      "vs last month": "vs last month",
      "Recent Orders": "Recent Orders",
      "Product Details": "Product Details",
      "General": "General",
      "Revenue": "Revenue",
      "Sales": "Sales",
      "Stock": "Stock",
      "Status": "Status",
      "Low Stock": "Low Stock",
      "In Stock": "In Stock"
      // Add more translations here
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en },
    },
  });

export default i18n;
