import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

const savedLanguage = localStorage.getItem("i18nextLng") || "en";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: savedLanguage,
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
    detection: {
      order: ["localStorage", "cookie", "navigator"],
      lookupLocalStorage: "i18nextLng",
      lookupCookie: "i18nextLng",
      caches: ["localStorage", "cookie"],
    },
    react: {
      useSuspense: true,
    },
  });

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem("i18nextLng", lng);
});

export default i18n;
