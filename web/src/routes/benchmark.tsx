import { useState, useRef } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { MODELS, DEFAULT_TONE, getProvider } from "functions/constants"
import type { ToneSettings as ToneSettingsType, Model, Provider } from "functions/constants"
import type { BenchmarkResult } from "functions/types"
import { useLocale } from "@/hooks/useLocale"
import { isKorean } from "@/lib/detectLanguage"
import { benchmark } from "@/api/benchmark"
import { ToneSettings } from "@/components/common/ToneSettings"
import { LoadingBubble } from "@/components/chat/MessageBubble"
import styles from "./benchmark.module.css"

const SAMPLE_EN = `Hey team, heads up, the staking pool is having some issues. When users try to withdraw, the displayed token price doesn't match the actual swap price, so people are getting less than expected. Looks like the price updates are delayed by about 15 seconds. Also, transaction fees have been way higher than usual since the last update, around 40% more than they should be. Can someone check the fee settings? We should fix this before more users start complaining.`

const SAMPLE_KO = `얘들아 참고로, 스테이킹 풀에 문제 좀 있어. 유저가 출금하려고 하면 화면에 보이는 토큰 가격이랑 실제 스왑 가격이 안 맞아서 예상보다 적게 받고 있거든. 가격 업데이트가 15초 정도 지연되는 것 같아. 그리고 지난 업데이트 이후로 트랜잭션 수수료가 원래보다 40% 정도 높게 나오고 있음. 수수료 설정 쪽 누가 한번 확인 좀 해줄 수 있어? 유저 컴플레인 더 들어오기 전에 고쳐야 될 것 같은데.`

const DEFAULT_MODELS: Model[] = ["gpt-5.2", "claude-opus-4-6", "gemini-3-pro-preview"]

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: "GPT",
  claude: "Claude",
  gemini: "Gemini",
}

const MODEL_GROUPS = (["openai", "claude", "gemini"] as const).map((provider) => ({
  provider,
  label: PROVIDER_LABELS[provider],
  models: MODELS.filter((m) => getProvider(m) === provider),
}))

export const Route = createFileRoute("/benchmark")({
  component: BenchmarkPage,
})

function BenchmarkPage() {
  const { t } = useLocale()
  const [text, setText] = useState("")
  const [selectedModels, setSelectedModels] = useState<Model[]>([...DEFAULT_MODELS])
  const [tone, setTone] = useState<ToneSettingsType>(DEFAULT_TONE)
  const [resultMap, setResultMap] = useState<Map<Model, BenchmarkResult | null>>(new Map())
  const [loading, setLoading] = useState(false)
  const pendingCount = useRef(0)

  const toggleModel = (model: Model) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model],
    )
  }

  const handleRun = async () => {
    if (!text.trim() || selectedModels.length === 0) return

    setLoading(true)

    const initial = new Map<Model, BenchmarkResult | null>()
    for (const model of selectedModels) initial.set(model, null)
    setResultMap(initial)

    pendingCount.current = selectedModels.length

    const trimmed = trimmedText
    const korean = koreanText

    const promises = selectedModels.map(async (model) => {
      try {
        const response = await benchmark({
          text: trimmed,
          isKorean: korean,
          models: [model],
          tone,
        })
        setResultMap((prev) => new Map(prev).set(model, response.results[0]))
      } catch (error) {
        setResultMap((prev) =>
          new Map(prev).set(model, {
            model,
            translation: "",
            durationMs: 0,
            error: error instanceof Error ? error.message : "Translation failed",
          }),
        )
      } finally {
        pendingCount.current -= 1
        if (pendingCount.current === 0) setLoading(false)
      }
    })

    await Promise.allSettled(promises)
  }

  const trimmedText = text.trim()
  const koreanText = trimmedText ? isKorean(trimmedText) : false
  const canRun = trimmedText.length > 0 && selectedModels.length > 0 && !loading

  const sortedEntries = [...resultMap.entries()].sort(([, a], [, b]) => {
    if (a === null && b === null) return 0
    if (a === null) return 1
    if (b === null) return -1
    return a.durationMs - b.durationMs
  })

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("benchmark.title")}</h1>

      <div className={styles.section}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("benchmark.placeholder")}
          disabled={loading}
        />
        <div className={styles.textareaFooter}>
          {trimmedText && (
            <span className={styles.direction}>{koreanText ? "🇰🇷 → 🇺🇸" : "🇺🇸 → 🇰🇷"}</span>
          )}
          <div className={styles.sampleButtons}>
            <span className={styles.sampleLabel}>{t("benchmark.sample")}</span>
            <button
              type="button"
              className={styles.sampleButton}
              onClick={() => setText(SAMPLE_EN)}
              disabled={loading}
            >
              EN
            </button>
            <button
              type="button"
              className={styles.sampleButton}
              onClick={() => setText(SAMPLE_KO)}
              disabled={loading}
            >
              KO
            </button>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("benchmark.selectModels")}</h2>
        <div className={styles.modelGroups}>
          {MODEL_GROUPS.map(({ provider, label, models }) => (
            <div key={provider} className={styles.modelGroup}>
              <span className={styles.modelGroupLabel}>{label}</span>
              <div className={styles.models}>
                {models.map((model) => {
                  const checked = selectedModels.includes(model)
                  return (
                    <label key={model} className={styles.modelLabel} data-checked={checked}>
                      <input
                        type="checkbox"
                        className={styles.modelCheckbox}
                        checked={checked}
                        onChange={() => toggleModel(model)}
                        disabled={loading}
                      />
                      {model}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <ToneSettings value={tone} onChange={setTone} />
      </div>

      <div className={styles.section}>
        <button className={styles.runButton} onClick={handleRun} disabled={!canRun}>
          {loading ? (
            <>
              <Loader2 size={16} className={styles.spinner} />
              <span>{t("benchmark.running")}</span>
            </>
          ) : (
            <span>{t("benchmark.run")}</span>
          )}
        </button>
      </div>

      {resultMap.size > 0 && (
        <div className={styles.section}>
          <div className={styles.results}>
            {sortedEntries.map(([model, result]) => (
              <div key={model} className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultModel}>{model}</span>
                  {result && (
                    <span className={styles.resultDuration}>
                      {(result.durationMs / 1000).toFixed(2)}s
                    </span>
                  )}
                </div>
                {result === null ? (
                  <LoadingBubble />
                ) : result.error ? (
                  <div className={styles.resultError}>{result.error}</div>
                ) : (
                  <div className={styles.resultContent}>{result.translation}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
