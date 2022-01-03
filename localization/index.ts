import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as RNLocalize from 'react-native-localize'

import en from './en'
import es from './es'

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
}

const defaultLanguage = 'en'
const availableLanguages = Object.keys(resources)
const bestLanguageMatch = RNLocalize.findBestAvailableLanguage(availableLanguages)
let translationToUse = defaultLanguage
if (bestLanguageMatch && availableLanguages.includes(bestLanguageMatch.languageTag)) {
  translationToUse = bestLanguageMatch.languageTag
}

i18n.use(initReactI18next).init({
  debug: false,
  lng: translationToUse,
  fallbackLng: defaultLanguage,
  resources,
  compatibilityJSON: 'v3'
})

export { i18n }
