import { Minimize2 } from "lucide-react"
import Markdown from "react-markdown"
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
    <div className={styles.translationWrapper}>
      <div className={clsx(styles.container, styles.translation)}>
        <div className={styles.content}>
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
      <div className={styles.actions}>
        <CopyButton text={message.content} className={styles.actionButton} />
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
  isRetranslating?: boolean
  onRetranslate?: (text: string, parentId: string) => void
}

export function MessageGroup({
  sourceMessage,
  translations,
  isRetranslating,
  onRetranslate,
}: MessageGroupProps) {
  return (
    <>
      <MessageBubble message={sourceMessage} />
      <div className={styles.translationGroup}>
        {translations.map((translation) => (
          <MessageBubble key={translation.id} message={translation} onRetranslate={onRetranslate} />
        ))}
        {isRetranslating && <LoadingBubble />}
      </div>
    </>
  )
}

export function LoadingBubble() {
  return (
    <div className={clsx(styles.container, styles.translation, styles.loading)}>
      <div className={styles.loadingDots}>
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
