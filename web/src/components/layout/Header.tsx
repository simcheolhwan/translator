import { Languages, Settings } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useAuth } from "@/hooks/useAuth"
import { useLocale } from "@/hooks/useLocale"
import type { UILanguage } from "@/lib/constants"
import styles from "./Header.module.css"

export function Header() {
  const { isAuthenticated } = useAuth()
  const { locale, t, switchLocale } = useLocale()

  const handleLanguageToggle = () => {
    const newLocale: UILanguage = locale === "en" ? "ko" : "en"
    switchLocale(newLocale)
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <Languages size={24} className={styles.logoIcon} />
        <span className={styles.logoText}>{t("app.title")}</span>
      </Link>

      <div className={styles.actions}>
        <button
          className={styles.languageButton}
          onClick={handleLanguageToggle}
          aria-label="Toggle language"
        >
          <Languages size={16} />
          <span>{t(`language.${locale}`)}</span>
        </button>

        {isAuthenticated && (
          <Link to="/settings" className={styles.settingsButton} aria-label={t("header.settings")}>
            <Settings size={20} />
          </Link>
        )}
      </div>
    </header>
  )
}
