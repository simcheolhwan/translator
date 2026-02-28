import { useCallback, useRef, type FormEvent, type KeyboardEvent, useState } from "react"
import { Popover } from "@base-ui/react/popover"
import { Send, Loader2, ClipboardPaste, Settings } from "lucide-react"
import { useLocale } from "@/hooks/useLocale"
import { ModelSelector } from "@/components/common/ModelSelector"
import { ToneSettings } from "@/components/common/ToneSettings"
import { isKorean } from "@/lib/detectLanguage"
import type { Model, ToneSettings as ToneSettingsType } from "functions/constants"
import styles from "./ChatInput.module.css"

interface ChatInputProps {
  model: Model
  tone: ToneSettingsType
  isLoading: boolean
  autoFocus?: boolean
  onModelChange: (model: Model) => void
  onToneChange: (tone: ToneSettingsType) => void
  onSubmit: (text: string) => void
}

export function ChatInput({
  model,
  tone,
  isLoading,
  autoFocus,
  onModelChange,
  onToneChange,
  onSubmit,
}: ChatInputProps) {
  const { t } = useLocale()
  const [text, setText] = useState("")
  const isComposingRef = useRef(false)

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
      if (isComposingRef.current) return

      if (e.key === "Enter" && !e.shiftKey) {
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

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true
  }, [])

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false
  }, [])

  const handlePaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      if (clipboardText) {
        setText((prev) => prev + clipboardText)
      }
    } catch {
      // Clipboard access denied
    }
  }, [])

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder={t("chat.placeholder")}
        autoFocus={autoFocus}
      />

      <div className={styles.toolbar}>
        <div className={styles.settings}>
          <ModelSelector value={model} onChange={onModelChange} />
          <ToneSettings value={tone} onChange={onToneChange} />
        </div>

        <Popover.Root>
          <Popover.Trigger className={styles.settingsToggle}>
            <Settings size={16} />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner sideOffset={8}>
              <Popover.Popup className={styles.popover}>
                <div className={styles.popoverContent}>
                  <ModelSelector value={model} onChange={onModelChange} />
                  <ToneSettings value={tone} onChange={onToneChange} />
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        {text.trim() && (
          <span className={styles.direction}>{isKorean(text) ? "🇰🇷 → 🇺🇸" : "🇺🇸 → 🇰🇷"}</span>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.pasteButton}
            onClick={handlePaste}
            title={t("chat.paste")}
          >
            <ClipboardPaste size={16} />
            <span className={styles.pasteLabel}>{t("chat.paste")}</span>
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!text.trim() || isLoading}
            title={t("chat.send")}
          >
            {isLoading ? <Loader2 size={16} className={styles.spinner} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </form>
  )
}
