import type { Model, ToneSettings } from "../shared/constants.js"
import { getProvider } from "../shared/constants.js"
import type { TranslationPair } from "./database.js"
import {
  translate as openaiTranslate,
  generateSessionMetadata as openaiMetadata,
} from "./openai.js"
import {
  translate as claudeTranslate,
  generateSessionMetadata as claudeMetadata,
} from "./claude.js"
import {
  translate as geminiTranslate,
  generateSessionMetadata as geminiMetadata,
} from "./gemini.js"

export interface TranslateOptions {
  apiKey: string
  text: string
  isKorean: boolean
  model: Model
  tone: ToneSettings
  context: TranslationPair[]
  userInstruction?: string
  concise?: boolean
  previousTranslation?: string
}

export interface SessionMetadata {
  username?: string
  description: string
}

export async function translate(options: TranslateOptions): Promise<string> {
  const provider = getProvider(options.model)
  switch (provider) {
    case "claude":
      return claudeTranslate(options)
    case "gemini":
      return geminiTranslate(options)
    default:
      return openaiTranslate(options)
  }
}

export async function generateSessionMetadata(
  apiKey: string,
  text: string,
  model: Model,
): Promise<SessionMetadata> {
  const provider = getProvider(model)
  switch (provider) {
    case "claude":
      return claudeMetadata(apiKey, text, model)
    case "gemini":
      return geminiMetadata(apiKey, text, model)
    default:
      return openaiMetadata(apiKey, text, model)
  }
}
