import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import uiEN from './locales/en/ui.json';
import uiKO from './locales/ko/ui.json';
import gloveEN from './locales/en/glove.json';
import gloveKO from './locales/ko/glove.json';
import effectsEN from './locales/en/effects.json';
import effectsKO from './locales/ko/effects.json';
import roundRuleEN from './locales/en/roundRule.json';
import roundRuleKO from './locales/ko/roundRule.json';


i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        ui: uiEN,
        glove: gloveEN,
        effects: effectsEN,
        roundRule: roundRuleEN
      },
      ko: {
        ui: uiKO,
        glove: gloveKO,
        effects: effectsKO,
        roundRule: roundRuleKO
      }
    },
    lng: navigator.language || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 