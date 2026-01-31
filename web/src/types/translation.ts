import type { ToneSettings, Model } from "@/lib/constants"

export interface TranslateRequest {
  sessionId?: string
  text: string
  model: Model
  tone: ToneSettings
  concise?: boolean // For re-translate more concisely
  parentMessageId?: string // Reference to original translation
}

export interface TranslateResponse {
  sessionId: string
  sourceMessageId: string
  translationMessageId: string
  translatedText: string
}
