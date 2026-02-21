import { useState, useCallback } from "react"
import { SpellCheck, ChevronDown, ChevronRight } from "lucide-react"
import { useLocale } from "@/hooks/useLocale"
import { useGrammarCheck } from "@/hooks/useGrammarCheck"
import { isKorean } from "@/lib/detectLanguage"
import { GRAMMAR_CHECK_SYSTEM_PROMPT } from "functions/prompts"
import { GrammarInput } from "./GrammarInput"
import { GrammarSource, GrammarLoading, GrammarError, GrammarResult } from "./GrammarBubble"
import styles from "./GrammarView.module.css"

export function GrammarView() {
  const { t } = useLocale()
  const { check, model, setModel, isChecking, error, result, sourceText } = useGrammarCheck()
  const [promptExpanded, setPromptExpanded] = useState(false)
  const [koreanWarning, setKoreanWarning] = useState(false)

  const handleSubmit = useCallback(
    (text: string) => {
      if (isKorean(text)) {
        setKoreanWarning(true)
        return
      }

      setKoreanWarning(false)
      check(text)
    },
    [check],
  )

  const isEmpty = !sourceText

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{t("grammar.title")}</span>
        <button className={styles.promptToggle} onClick={() => setPromptExpanded((prev) => !prev)}>
          {promptExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>{t("grammar.systemPrompt")}</span>
        </button>
      </div>

      {promptExpanded && <pre className={styles.systemPrompt}>{GRAMMAR_CHECK_SYSTEM_PROMPT}</pre>}

      <div className={styles.messages}>
        {isEmpty ? (
          <div className={styles.empty}>
            <SpellCheck size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>{t("grammar.description")}</p>
          </div>
        ) : (
          <>
            <GrammarSource text={sourceText} />
            <div className={styles.resultsGroup}>
              {isChecking && <GrammarLoading />}
              {error && <GrammarError message={error.message} />}
              {result && <GrammarResult result={result} />}
            </div>
          </>
        )}
      </div>

      {koreanWarning && <div className={styles.warning}>{t("grammar.koreanWarning")}</div>}

      <GrammarInput
        model={model}
        isLoading={isChecking}
        autoFocus
        onModelChange={setModel}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
