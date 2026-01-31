import { useState, useCallback, type FormEvent, type KeyboardEvent } from "react"
import { Send, Loader2 } from "lucide-react"
import { useLocale } from "@/hooks/useLocale"
import { ModelSelector } from "@/components/common/ModelSelector"
import { ToneSettings } from "@/components/common/ToneSettings"
import type { Model, ToneSettings as ToneSettingsType } from "@/lib/constants"
import styles from "./ChatInput.module.css"

interface ChatInputProps {
  model: Model
  tone: ToneSettingsType
  isLoading: boolean
  onModelChange: (model: Model) => void
  onToneChange: (tone: ToneSettingsType) => void
  onSubmit: (text: string) => void
}

export function ChatInput({
  model,
  tone,
  isLoading,
  onModelChange,
  onToneChange,
  onSubmit,
}: ChatInputProps) {
  const { t } = useLocale()
  const [text, setText] = useState("")

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const trimmed = text.trim()
      if (!trimmed || isLoading) return

      onSubmit(trimmed)
      setText("")
    },
    [text, isLoading, onSubmit],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Ctrl/Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        const trimmed = text.trim()
        if (trimmed && !isLoading) {
          onSubmit(trimmed)
          setText("")
        }
      }
    },
    [text, isLoading, onSubmit],
  )

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.settings}>
        <ModelSelector value={model} onChange={onModelChange} />
        <ToneSettings value={tone} onChange={onToneChange} />
      </div>

      <div className={styles.inputRow}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("chat.placeholder")}
          disabled={isLoading}
        />
        <button type="submit" className={styles.submitButton} disabled={!text.trim() || isLoading}>
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          <span>{t("chat.send")}</span>
        </button>
      </div>
    </form>
  )
}
