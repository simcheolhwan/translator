export const MODELS = [
  "gpt-5.2",
  "gpt-5-mini",
  "gpt-5-nano",
  "claude-opus-4-6",
  "claude-sonnet-4-6",
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
] as const
export type Model = (typeof MODELS)[number]
export const DEFAULT_MODEL: Model = "gpt-5.2"

export type Provider = "openai" | "claude" | "gemini"

export function getProvider(model: Model): Provider {
  if (model.startsWith("claude-")) return "claude"
  if (model.startsWith("gemini-")) return "gemini"
  return "openai"
}

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

// Session length warning threshold (characters)
export const SESSION_WARNING_THRESHOLD = 40000
export const SESSION_MAX_CONTEXT_SIZE = 50000
