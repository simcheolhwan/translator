import { AlertTriangle } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { useLocale } from "@/hooks/useLocale"
import styles from "./SessionWarning.module.css"

interface SessionWarningProps {
  show: boolean
}

export function SessionWarning({ show }: SessionWarningProps) {
  const { t } = useLocale()
  const navigate = useNavigate()

  if (!show) return null

  const handleNewSession = () => {
    navigate({ to: "/" })
  }

  return (
    <div className={styles.warning}>
      <div className={styles.message}>
        <AlertTriangle size={16} />
        <span>{t("warning.sessionTooLong")}</span>
      </div>
      <button className={styles.button} onClick={handleNewSession}>
        {t("warning.newSession")}
      </button>
    </div>
  )
}
