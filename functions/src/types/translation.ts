import type { ToneSettings, Model } from "../lib/constants.js"

export interface TranslateRequest {
  sessionId?: string
  text: string
  isKorean: boolean
  model: Model
  tone: ToneSettings
  concise?: boolean
  parentMessageId?: string
}

export interface TranslateResponse {
  sessionId: string
  sourceMessageId: string
  translationMessageId: string
  translatedText: string
}
