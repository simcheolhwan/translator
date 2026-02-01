import { useCallback, useMemo, useRef, useEffect } from "react"
import { Languages } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { useLocale } from "@/hooks/useLocale"
import { useTranslate } from "@/hooks/useTranslate"
import { useRealtimeSession } from "@/hooks/useRealtimeSession"
import { useSessionWarning } from "@/hooks/useSessionWarning"
import { ChatInput } from "./ChatInput"
import { MessageGroup } from "./MessageBubble"
import { SessionWarning } from "./SessionWarning"
import type { Message } from "@/types/session"
import styles from "./ChatView.module.css"

interface ChatViewProps {
  sessionId?: string
}

interface MessagePair {
  source: Message
  translations: Message[]
}

export function ChatView({ sessionId }: ChatViewProps) {
  const { t } = useLocale()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { session } = useRealtimeSession(sessionId)
  const { showWarning } = useSessionWarning(sessionId)

  const { translate, retranslate, model, setModel, tone, setTone, isTranslating } = useTranslate({
    sessionId,
    onSuccess: (newSessionId) => {
      if (!sessionId) {
        navigate({ to: "/session/$sessionId", params: { sessionId: newSessionId } })
      }
    },
  })

  // Group messages by source and their translations
  const messagePairs = useMemo<MessagePair[]>(() => {
    if (!session?.messages) return []

    const pairs: MessagePair[] = []
    const messages = [...session.messages].sort((a, b) => a.createdAt - b.createdAt)

    let currentPair: MessagePair | null = null

    for (const msg of messages) {
      if (msg.type === "source") {
        if (currentPair) {
          pairs.push(currentPair)
        }
        currentPair = { source: msg, translations: [] }
      } else if (msg.type === "translation" && currentPair) {
        currentPair.translations.push(msg)
      }
    }

    if (currentPair) {
      pairs.push(currentPair)
    }

    return pairs
  }, [session?.messages])

  const handleSubmit = useCallback(
    (text: string) => {
      translate(text)
    },
    [translate],
  )

  const handleRetranslate = useCallback(
    (_text: string, parentId: string) => {
      // Find the source text for this translation
      const pair = messagePairs.find((p) => p.translations.some((t) => t.id === parentId))
      if (pair) {
        retranslate(pair.source.content, parentId)
      }
    },
    [messagePairs, retranslate],
  )

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messagePairs])

  const isEmpty = messagePairs.length === 0

  return (
    <div className={styles.container}>
      <SessionWarning show={showWarning} />

      <div className={styles.messages}>
        {isEmpty ? (
          <div className={styles.empty}>
            <Languages size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>{t("app.description")}</p>
          </div>
        ) : (
          <>
            {messagePairs.map((pair) => (
              <MessageGroup
                key={pair.source.id}
                sourceMessage={pair.source}
                translations={pair.translations}
                onRetranslate={handleRetranslate}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        model={model}
        tone={tone}
        isLoading={isTranslating}
        autoFocus
        onModelChange={setModel}
        onToneChange={setTone}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
