import { Minimize2, AlertCircle } from "lucide-react"
import Markdown from "react-markdown"
import { useLocale } from "@/hooks/useLocale"
import { CopyButton } from "@/components/common/CopyButton"
import type { Message } from "functions/types"
import styles from "./MessageBubble.module.css"

interface MessageBubbleProps {
  message: Message
  onRetranslate?: (text: string, parentId: string) => void
}

export function MessageBubble({ message, onRetranslate }: MessageBubbleProps) {
  const { t } = useLocale()

  if (message.type === "source") {
    return (
      <div className={styles.sourceContainer}>
        <div className={styles.sourceBubble}>
          <div className={styles.sourceText}>{message.content}</div>
        </div>
        <div className={styles.actions}>
          <CopyButton text={message.content} />
        </div>
      </div>
    )
  }

  if (message.status === "pending") {
    return <LoadingBubble />
  }

  if (message.status === "error") {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBubble}>
          <AlertCircle size={16} className={styles.errorIcon} />
          <span className={styles.errorText}>{message.errorMessage ?? t("chat.failed")}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.translationContainer}>
      <div className={styles.translationBubble}>
        <div className={styles.translationContent}>
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
      <div className={styles.actions}>
        <CopyButton text={message.content} />
        {onRetranslate && (
          <button
            className={styles.retranslateButton}
            onClick={() => onRetranslate(message.content, message.id)}
          >
            <Minimize2 size={12} />
            <span>{t("chat.retranslate")}</span>
          </button>
        )}
        {message.durationMs != null && (
          <span className={styles.duration}>{(message.durationMs / 1000).toFixed(2)}s</span>
        )}
      </div>
    </div>
  )
}

interface MessageGroupProps {
  sourceMessage: Message
  translations: Message[]
  onRetranslate?: (text: string, parentId: string) => void
}

export function MessageGroup({ sourceMessage, translations, onRetranslate }: MessageGroupProps) {
  return (
    <>
      <MessageBubble message={sourceMessage} />
      <div className={styles.translationsGroup}>
        {translations.map((translation) => (
          <MessageBubble key={translation.id} message={translation} onRetranslate={onRetranslate} />
        ))}
      </div>
    </>
  )
}

export function LoadingBubble() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingDots}>
        <span className={styles.loadingDot} />
        <span className={styles.loadingDot} />
        <span className={styles.loadingDot} />
      </div>
    </div>
  )
}
