import type { Model } from "../constants.js"

export interface GrammarCheckRequest {
  text: string
  model: Model
}

export interface GrammarCheckResponse {
  corrected: string
  explanation: string | null
  durationMs: number
}
