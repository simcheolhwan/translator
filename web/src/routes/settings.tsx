import { useState, useEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Check, Loader2, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useLocale } from "@/hooks/useLocale"
import { useSettingsQuery, useUpdateSettingsMutation } from "@/queries/settings"
import { SYSTEM_PROMPT } from "@/lib/systemPrompt"
import styles from "./settings.module.css"

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const { logout } = useAuth()
  const { t } = useLocale()
  const { data: settings, isLoading } = useSettingsQuery()
  const updateMutation = useUpdateSettingsMutation()

  const [instruction, setInstruction] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setInstruction(settings.globalInstruction)
    }
  }, [settings])

  const handleSave = async () => {
    await updateMutation.mutateAsync(instruction)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const hasChanges = settings?.globalInstruction !== instruction

  const handleSignOut = () => {
    if (confirm(t("header.signOutConfirm"))) {
      logout()
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("settings.title")}</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("settings.globalInstruction")}</h2>
        <p className={styles.sectionHint}>{t("settings.globalInstructionHint")}</p>
        <textarea
          className={styles.textarea}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={isLoading}
          placeholder="e.g., Always use formal Korean (존댓말)"
        />
        <div className={styles.actions}>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
          >
            {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
            <span>{t("settings.save")}</span>
          </button>
          {saved && (
            <span className={styles.savedMessage}>
              <Check size={16} />
              {t("settings.saved")}
            </span>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("settings.systemPrompt")}</h2>
        <p className={styles.sectionHint}>{t("settings.systemPromptHint")}</p>
        <textarea
          className={`${styles.textarea} ${styles.readonlyTextarea}`}
          value={SYSTEM_PROMPT}
          readOnly
        />
      </div>

      <div className={styles.dangerSection}>
        <button className={styles.signOutButton} onClick={handleSignOut}>
          <LogOut size={16} />
          <span>{t("header.signOut")}</span>
        </button>
      </div>
    </div>
  )
}
