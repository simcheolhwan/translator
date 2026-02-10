// Cloud Functions region (Seoul)
export const FUNCTION_REGION = "asia-northeast3"

export const MODELS = ["gpt-5.2"] as const
export type Model = (typeof MODELS)[number]
export const DEFAULT_MODEL: Model = "gpt-5.2"

export const TONE_SETTINGS = {
  translationStyle: ["paraphrase", "literal"] as const,
  formality: ["casual", "formal"] as const,
  domain: ["technical", "general"] as const,
} as const

export type TranslationStyle = (typeof TONE_SETTINGS.translationStyle)[number]
export type Formality = (typeof TONE_SETTINGS.formality)[number]
export type Domain = (typeof TONE_SETTINGS.domain)[number]

export interface ToneSettings {
  translationStyle: TranslationStyle
  formality: Formality
  domain: Domain
}

export const DEFAULT_TONE: ToneSettings = {
  translationStyle: "paraphrase",
  formality: "casual",
  domain: "technical",
}

// Session length warning threshold (characters)
export const SESSION_WARNING_THRESHOLD = 40000
export const SESSION_MAX_CONTEXT_SIZE = 50000
