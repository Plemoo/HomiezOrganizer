import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import de from "../../locales/de.json";
import en from "../../locales/en.json";

// Verfügbare Sprachen
const resources = { en: { translation: en }, de: { translation: de } };
// const detectLocale =  (callback:(lng: string | readonly string[] | undefined) => void):void => {
//   let storedLocale:Promise<string|null> = new Promise((resolve) => {
//     try{
//       if(Platform.OS === "web"){
//         resolve(window.localStorage.getItem("language"));
//       }else if (Platform.OS === "android" || Platform.OS === "ios"){
//         resolve(AsyncStorage.getItem("language"));
//       }else{
//         console.log("Platform not supported for language detection.");
//         resolve(null);
//       }
//     }catch(e){
//       console.log("Error while getting language from AsyncStorage: ", e); 
//       resolve(null);
//     }
//   });
//   storedLocale.then((value) =>value ? callback(value) : callback("de"));
//   return;
// };

// const languageDetector: LanguageDetectorAsyncModule = {
//   type: "languageDetector",
//   async: true,
//   detect: detectLocale
// };

i18next
  // .use(languageDetector) // Verwende den benutzerdefinierten Sprachdetektor
  .use(initReactI18next)
  .init({
    resources,
    // lng:Localization.getLocales()[0].languageTag, // Standardmäßig die Sprache des Geräts verwenden  
    fallbackLng: "de",
    interpolation: { escapeValue: false },
  });

export default i18next;
