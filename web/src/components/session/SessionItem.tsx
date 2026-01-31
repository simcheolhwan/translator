import { memo, type MouseEvent } from "react"
import { Trash2 } from "lucide-react"
import { Link, useParams } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { useLocale } from "@/hooks/useLocale"
import type { SessionListItem } from "@/types/session"
import clsx from "clsx"
import styles from "./SessionItem.module.css"

interface SessionItemProps {
  session: SessionListItem
  onDelete: (sessionId: string) => void
}

export const SessionItem = memo(function SessionItem({ session, onDelete }: SessionItemProps) {
  const { t } = useLocale()
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
      className={clsx(styles.item, isActive && styles.itemActive)}
    >
      <div className={styles.content}>
        <div className={styles.title}>{session.title}</div>
        <div className={styles.date}>
          {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
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
