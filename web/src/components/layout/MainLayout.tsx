import type { ReactNode } from "react"
import clsx from "clsx"
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

  if (!loaded) {
    return null
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.body}>
        {isAuthenticated && <Sidebar />}
        <main className={clsx(styles.main, isAuthenticated && styles.mainWithSidebar)}>
          {loading ? null : isAuthenticated ? (
            children
          ) : (
            <div className={styles.loginScreen}>
              <h2 className={styles.loginTitle}>{t("app.title")}</h2>
              <p className={styles.loginDescription}>{t("app.description")}</p>
              <button className={styles.loginButton} onClick={login}>
                {t("header.signIn")}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
