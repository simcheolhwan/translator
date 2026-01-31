import { memo } from "react"
import { useLocale } from "@/hooks/useLocale"
import { SessionItem } from "./SessionItem"
import { SessionGroup } from "./SessionGroup"
import type { SessionListItem } from "@/types/session"
import styles from "./SessionList.module.css"

interface SessionListProps {
  recentSessions: SessionListItem[]
  olderSessions: SessionListItem[]
  isLoading: boolean
  onDelete: (sessionId: string) => void
}

export const SessionList = memo(function SessionList({
  recentSessions,
  olderSessions,
  isLoading,
  onDelete,
}: SessionListProps) {
  const { t } = useLocale()

  if (isLoading) {
    return (
      <div className={styles.loading}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    )
  }

  const isEmpty = recentSessions.length === 0 && olderSessions.length === 0

  if (isEmpty) {
    return <div className={styles.empty}>{t("sidebar.noSessions")}</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.recent}>
        {recentSessions.map((session) => (
          <SessionItem key={session.id} session={session} onDelete={onDelete} />
        ))}
      </div>

      <SessionGroup sessions={olderSessions} onDelete={onDelete} />
    </div>
  )
})
