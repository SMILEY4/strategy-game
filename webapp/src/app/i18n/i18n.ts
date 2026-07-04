import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import {initReactI18next} from "react-i18next";

/** Initialize i18next with HTTP backend, language detection, and react-i18next integration. */
void i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        supportedLngs: ["en", "de"],
        fallbackLng: (_code) => {
            return 'en';
        },
        debug: true,
        detection: {
            order: ["querystring", "localStorage", "navigator"],
            lookupQuerystring: "lang"
        },
        interpolation: {
            escapeValue: false,
        },
        backend: {
            loadPath: `/locales/{{lng}}/{{ns}}.json`,
        },
    });
