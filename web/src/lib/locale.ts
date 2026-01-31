import type { UILanguage } from "./constants"

type Translations = Record<string, string>

const translationsCache: Partial<Record<UILanguage, Translations>> = {}

export async function loadTranslations(locale: UILanguage): Promise<void> {
  if (translationsCache[locale]) return

  const response = await fetch(`/locales/${locale}.json`)
  translationsCache[locale] = await response.json()
}

export function t(key: string, locale: UILanguage): string {
  const translations = translationsCache[locale]
  if (!translations) return key
  return translations[key] ?? key
}

export function getTranslations(locale: UILanguage): Translations {
  return translationsCache[locale] ?? {}
}
