import { Plus, Trash2 } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { useLocale } from "@/hooks/useLocale"
import { useSessions } from "@/hooks/useSessions"
import { SessionList } from "@/components/session/SessionList"
import styles from "./Sidebar.module.css"

export function Sidebar() {
  const { t } = useLocale()
  const navigate = useNavigate()

  const { recentSessions, olderSessions, isLoading, deleteSession, clearAll, isClearing } =
    useSessions()

  const handleNewSession = () => {
    navigate({ to: "/" })
  }

  const handleClearAll = () => {
    if (confirm(t("sidebar.clearAll") + "?")) {
      clearAll()
      navigate({ to: "/" })
    }
  }

  const hasAnySessions = recentSessions.length > 0 || olderSessions.length > 0

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <button className={styles.newButton} onClick={handleNewSession}>
          <Plus size={16} />
          <span>{t("sidebar.newSession")}</span>
        </button>
      </div>

      <div className={styles.content}>
        <SessionList
          recentSessions={recentSessions}
          olderSessions={olderSessions}
          isLoading={isLoading}
          onDelete={deleteSession}
        />
      </div>

      {hasAnySessions && (
        <div className={styles.footer}>
          <button className={styles.clearButton} onClick={handleClearAll} disabled={isClearing}>
            <Trash2 size={16} />
            <span>{t("sidebar.clearAll")}</span>
          </button>
        </div>
      )}
    </aside>
  )
}
