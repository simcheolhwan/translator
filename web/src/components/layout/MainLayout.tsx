import type { ReactNode } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useLocale } from "@/hooks/useLocale"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import styles from "./MainLayout.module.css"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, loading, login } = useAuth()
  const { t, loaded } = useLocale()

  // Wait for locale to load
  if (!loaded) {
    return null
  }

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.body}>
        {isAuthenticated && <Sidebar />}
        <main className={styles.main}>
          {loading ? null : isAuthenticated ? (
            children
          ) : (
            <div className={styles.loginPrompt}>
              <h2>{t("app.title")}</h2>
              <p>{t("app.description")}</p>
              <button className={styles.signInButton} onClick={login}>
                {t("header.signIn")}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
