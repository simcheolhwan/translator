import { memo } from "react"
import { useLocale } from "@/hooks/useLocale"
import { SessionItem } from "./SessionItem"
import type { SessionListItem } from "@/types/session"
import styles from "./SessionList.module.css"

interface SessionListProps {
  sessions: SessionListItem[]
  onDelete: (sessionId: string) => void
}

export const SessionList = memo(function SessionList({ sessions, onDelete }: SessionListProps) {
  const { t } = useLocale()

  if (sessions.length === 0) {
    return <div className={styles.empty}>{t("sidebar.noSessions")}</div>
  }

  return (
    <div className={styles.container}>
      {sessions.map((session) => (
        <SessionItem key={session.id} session={session} onDelete={onDelete} />
      ))}
    </div>
  )
})
