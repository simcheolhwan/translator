import { Minimize2 } from "lucide-react"
import { useLocale } from "@/hooks/useLocale"
import { CopyButton } from "@/components/common/CopyButton"
import type { Message } from "@/types/session"
import clsx from "clsx"
import styles from "./MessageBubble.module.css"

interface MessageBubbleProps {
  message: Message
  onRetranslate?: (text: string, parentId: string) => void
}

export function MessageBubble({ message, onRetranslate }: MessageBubbleProps) {
  const { t } = useLocale()

  if (message.type === "source") {
    return (
      <div className={clsx(styles.container, styles.source)}>
        <div className={styles.content}>{message.content}</div>
      </div>
    )
  }

  return (
    <div className={clsx(styles.container, styles.translation)}>
      <div className={styles.content}>{message.content}</div>
      <div className={styles.actions}>
        <CopyButton text={message.content} />
        {onRetranslate && (
          <button
            className={styles.actionButton}
            onClick={() => onRetranslate(message.content, message.id)}
          >
            <Minimize2 size={12} />
            <span>{t("chat.retranslate")}</span>
          </button>
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
      <div className={styles.translationGroup}>
        {translations.map((translation) => (
          <MessageBubble key={translation.id} message={translation} onRetranslate={onRetranslate} />
        ))}
      </div>
    </>
  )
}
