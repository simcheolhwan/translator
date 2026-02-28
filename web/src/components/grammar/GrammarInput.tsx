import { useCallback, useRef, type FormEvent, type KeyboardEvent, useState } from "react"
import { Send, Loader2, ClipboardPaste } from "lucide-react"
import { useLocale } from "@/hooks/useLocale"
import { ModelSelector } from "@/components/common/ModelSelector"
import type { Model } from "functions/constants"
import styles from "./GrammarInput.module.css"

interface GrammarInputProps {
  model: Model
  isLoading: boolean
  autoFocus?: boolean
  onModelChange: (model: Model) => void
  onSubmit: (text: string) => void
}

export function GrammarInput({
  model,
  isLoading,
  autoFocus,
  onModelChange,
  onSubmit,
}: GrammarInputProps) {
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
        placeholder={t("grammar.placeholder")}
        autoFocus={autoFocus}
      />

      <div className={styles.toolbar}>
        <div className={styles.settings}>
          <ModelSelector value={model} onChange={onModelChange} />
        </div>

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
            title={t("grammar.send")}
          >
            {isLoading ? <Loader2 size={16} className={styles.spinner} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </form>
  )
}
