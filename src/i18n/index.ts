import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'

export const SUPPORTED_LANGUAGES = ['en', 'pt-BR'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]
export const DEFAULT_LANGUAGE: Language = 'en'
export const LANGUAGE_STORAGE_KEY = 'patholytics.language'

export function isSupportedLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
}

/** Maps anything the browser reports ("pt", "pt-PT", "en-GB") onto a locale we ship. */
export function normalizeLanguage(value: string | null | undefined): Language {
  if (!value) return DEFAULT_LANGUAGE
  if (isSupportedLanguage(value)) return value
  if (value.toLowerCase().startsWith('pt')) return 'pt-BR'
  if (value.toLowerCase().startsWith('en')) return 'en'
  return DEFAULT_LANGUAGE
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'pt-BR': { translation: ptBR },
    },
    supportedLngs: [...SUPPORTED_LANGUAGES],
    fallbackLng: DEFAULT_LANGUAGE,
    load: 'currentOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
      // Regional codes the browser reports ("pt", "pt-PT", "en-GB") are folded
      // onto a locale we actually ship. Doing it here rather than through
      // `nonExplicitSupportedLngs` matters: that option resolves a detected
      // "pt-BR" against its base code "pt", finds it absent from
      // `supportedLngs`, and silently serves the fallback instead.
      convertDetectedLanguage: (lng: string) => normalizeLanguage(lng),
    },
    interpolation: { escapeValue: false },
  })

/** Keeps <html lang> in step with the active locale for screen readers and SEO. */
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = normalizeLanguage(lng)
})

export default i18n
