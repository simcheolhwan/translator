import { useEffect, useState, useCallback } from "react"
import { useUIStore } from "@/stores/uiStore"
import { loadTranslations, t as translate, getTranslations } from "@/lib/locale"
import type { UILanguage } from "@/lib/constants"

export function useLocale() {
  const { locale, setLocale } = useUIStore()
  const [loaded, setLoaded] = useState(false)
  const [, forceUpdate] = useState({})

  useEffect(() => {
    loadTranslations(locale).then(() => {
      setLoaded(true)
      forceUpdate({})
    })
  }, [locale])

  const t = useCallback((key: string) => translate(key, locale), [locale])

  const switchLocale = useCallback(
    async (newLocale: UILanguage) => {
      await loadTranslations(newLocale)
      setLocale(newLocale)
    },
    [setLocale],
  )

  return {
    locale,
    t,
    switchLocale,
    loaded,
    translations: getTranslations(locale),
  }
}
