import type { Model } from "../shared/constants.js"
import { getProvider } from "../shared/constants.js"
import { openaiApiKey, claudeApiKey, geminiApiKey } from "./config.js"

export function getApiKey(model: Model): string {
  const provider = getProvider(model)
  switch (provider) {
    case "claude":
      return process.env.CLAUDE_API_KEY || claudeApiKey.value()
    case "gemini":
      return process.env.GEMINI_API_KEY || geminiApiKey.value()
    default:
      return process.env.OPENAI_API_KEY || openaiApiKey.value()
  }
}
