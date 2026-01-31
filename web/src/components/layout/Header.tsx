import { Languages, Menu, Settings } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useAuth } from "@/hooks/useAuth"
import { useLocale } from "@/hooks/useLocale"
import { useUIStore } from "@/stores/uiStore"
import type { UILanguage } from "@/lib/constants"
import styles from "./Header.module.css"

export function Header() {
  const { user, isAuthenticated, login, logout } = useAuth()
  const { locale, t, switchLocale } = useLocale()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  const handleLanguageToggle = () => {
    const newLocale: UILanguage = locale === "en" ? "ko" : "en"
    switchLocale(newLocale)
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {isAuthenticated && (
          <button className={styles.menuButton} onClick={toggleSidebar} aria-label="Toggle sidebar">
            <Menu size={20} />
          </button>
        )}
        <Link to="/" className={styles.logo}>
          <Languages size={24} />
          <span>{t("app.title")}</span>
        </Link>
      </div>

      <div className={styles.right}>
        <button
          className={styles.languageToggle}
          onClick={handleLanguageToggle}
          aria-label="Toggle language"
        >
          <Languages size={16} />
          <span>{t(`language.${locale}`)}</span>
        </button>

        {isAuthenticated ? (
          <>
            <Link to="/settings" className={styles.menuButton} aria-label={t("header.settings")}>
              <Settings size={20} />
            </Link>
            <button className={styles.userButton} onClick={logout}>
              {user?.photoURL && <img src={user.photoURL} alt="" className={styles.avatar} />}
              <span>{t("header.signOut")}</span>
            </button>
          </>
        ) : (
          <button className={styles.signInButton} onClick={login}>
            {t("header.signIn")}
          </button>
        )}
      </div>
    </header>
  )
}
