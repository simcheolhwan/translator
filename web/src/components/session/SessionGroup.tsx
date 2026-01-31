import { useState, memo } from "react"
import { ChevronRight } from "lucide-react"
import { useLocale } from "@/hooks/useLocale"
import { SessionItem } from "./SessionItem"
import type { SessionListItem } from "@/types/session"
import clsx from "clsx"
import styles from "./SessionGroup.module.css"

interface SessionGroupProps {
  sessions: SessionListItem[]
  onDelete: (sessionId: string) => void
  defaultExpanded?: boolean
}

export const SessionGroup = memo(function SessionGroup({
  sessions,
  onDelete,
  defaultExpanded = false,
}: SessionGroupProps) {
  const { t } = useLocale()
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (sessions.length === 0) return null

  return (
    <div className={styles.group}>
      <button className={styles.header} onClick={() => setExpanded(!expanded)}>
        <ChevronRight
          size={14}
          className={clsx(styles.chevron, expanded && styles.chevronExpanded)}
        />
        <span>{t("sidebar.olderSessions")}</span>
        <span className={styles.count}>{sessions.length}</span>
      </button>

      {expanded && (
        <div className={styles.content}>
          {sessions.map((session) => (
            <SessionItem key={session.id} session={session} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
})
