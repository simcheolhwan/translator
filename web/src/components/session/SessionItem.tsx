import { memo, type MouseEvent } from "react"
import { Trash2 } from "lucide-react"
import { Link, useParams } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { enUS, ko } from "date-fns/locale"
import { useLocale } from "@/hooks/useLocale"
import type { SessionListItem } from "@/types/session"
import styles from "./SessionItem.module.css"

interface SessionItemProps {
  session: SessionListItem
  onDelete: (sessionId: string) => void
}

export const SessionItem = memo(function SessionItem({ session, onDelete }: SessionItemProps) {
  const { locale, t } = useLocale()
  const dateLocale = locale === "ko" ? ko : enUS
  const params = useParams({ strict: false })
  const isActive = params.sessionId === session.id

  const handleDelete = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm(t("sidebar.deleteSession") + "?")) {
      onDelete(session.id)
    }
  }

  return (
    <Link
      to="/session/$sessionId"
      params={{ sessionId: session.id }}
      className={styles.item}
      data-active={isActive}
    >
      <div className={styles.content}>
        <div className={styles.info}>
          {session.username && <span className={styles.username}>{session.username}</span>}
          <span className={styles.description}>{session.description}</span>
        </div>
        <div className={styles.date}>
          {formatDistanceToNow(session.updatedAt, { addSuffix: true, locale: dateLocale })}
        </div>
      </div>
      <button
        className={styles.deleteButton}
        onClick={handleDelete}
        aria-label={t("sidebar.deleteSession")}
      >
        <Trash2 size={14} />
      </button>
    </Link>
  )
})
