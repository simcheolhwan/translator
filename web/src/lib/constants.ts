export const MODELS = ["gpt-5.2"] as const
export type Model = (typeof MODELS)[number]
export const DEFAULT_MODEL: Model = "gpt-5.2"

export const TONE_OPTIONS = {
  translationStyle: ["paraphrase", "literal"] as const,
  formality: ["casual", "formal"] as const,
  domain: ["technical", "general"] as const,
} as const

export type TranslationStyle = (typeof TONE_OPTIONS.translationStyle)[number]
export type Formality = (typeof TONE_OPTIONS.formality)[number]
export type Domain = (typeof TONE_OPTIONS.domain)[number]

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

// Session warning threshold
export const SESSION_WARNING_THRESHOLD = 40000
export const SESSION_MAX_CONTEXT_SIZE = 50000

// UI Languages
export const UI_LANGUAGES = ["en", "ko"] as const
export type UILanguage = (typeof UI_LANGUAGES)[number]
export const DEFAULT_UI_LANGUAGE: UILanguage = "en"
