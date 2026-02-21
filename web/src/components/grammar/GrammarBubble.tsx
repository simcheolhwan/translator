import Markdown from "react-markdown"
import { AlertCircle } from "lucide-react"
import { useLocale } from "@/hooks/useLocale"
import { CopyButton } from "@/components/common/CopyButton"
import { LoadingBubble } from "@/components/chat/MessageBubble"
import type { GrammarCheckResponse } from "functions/types"
import styles from "./GrammarBubble.module.css"

interface GrammarSourceProps {
  text: string
}

export function GrammarSource({ text }: GrammarSourceProps) {
  return (
    <div className={styles.sourceContainer}>
      <div className={styles.sourceBubble}>
        <div className={styles.sourceText}>{text}</div>
      </div>
      <div className={styles.actions}>
        <CopyButton text={text} />
      </div>
    </div>
  )
}

export function GrammarLoading() {
  return <LoadingBubble />
}

interface GrammarErrorProps {
  message?: string
}

export function GrammarError({ message }: GrammarErrorProps) {
  const { t } = useLocale()
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorBubble}>
        <AlertCircle size={16} className={styles.errorIcon} />
        <span className={styles.errorText}>{message ?? t("grammar.failed")}</span>
      </div>
    </div>
  )
}

interface GrammarResultProps {
  result: GrammarCheckResponse
}

export function GrammarResult({ result }: GrammarResultProps) {
  return (
    <div className={styles.resultContainer}>
      <div className={styles.correctedContent}>
        <Markdown>{result.corrected}</Markdown>
      </div>

      {result.explanation && (
        <div className={styles.explanation}>
          <Markdown>{result.explanation}</Markdown>
        </div>
      )}

      <div className={styles.actions}>
        <CopyButton text={result.corrected} />
        {result.durationMs != null && (
          <span className={styles.duration}>{(result.durationMs / 1000).toFixed(2)}s</span>
        )}
      </div>
    </div>
  )
}
