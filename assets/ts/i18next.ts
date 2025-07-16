import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import de from "../../locales/de.json";
import en from "../../locales/en.json";

// Verfügbare Sprachen
const resources = { en: { translation: en }, de: { translation: de } };

i18next
  .use(initReactI18next)
  .init({
    resources,
    // lng:Localization.getLocales()[0].languageTag, // Standardmäßig die Sprache des Geräts verwenden  
    fallbackLng: "de",
    interpolation: { escapeValue: false },
  });

export default i18next;

export function getDefaultLanguage(){
    if(i18next.language === "de"){
        return "de";
    }else if(i18next.language === "en"){
        return "en";
    }else{
        return "de";
    }
}