import type { ToneSettings } from "../lib/constants.js"
import type { TranslationPair } from "../services/database.js"
import { SYSTEM_PROMPT } from "./system.js"

interface TranslatePromptOptions {
  text: string
  tone: ToneSettings
  context: TranslationPair[]
  userInstruction?: string
  concise?: boolean
  previousTranslation?: string
}

export function buildTranslatePrompt(options: TranslatePromptOptions): string {
  const { text, tone, context, userInstruction, concise, previousTranslation } = options

  const parts: string[] = []

  // Style settings
  const styleLines: string[] = []

  if (tone.translationStyle === "literal") {
    styleLines.push("- Use literal translation, staying close to the original wording")
  } else {
    styleLines.push("- Use natural paraphrasing for fluent translation")
  }

  if (tone.formality === "formal") {
    styleLines.push("- Use formal language and honorifics")
  } else {
    styleLines.push("- Use casual, conversational language")
  }

  if (tone.domain === "technical") {
    styleLines.push("- Use technical/documentation terminology")
  } else {
    styleLines.push("- Use general, everyday language")
  }

  parts.push(`Style settings:\n${styleLines.join("\n")}`)

  // User instruction
  if (userInstruction?.trim()) {
    parts.push(`User instruction:\n${userInstruction}`)
  }

  // Concise translation: show previous translation and specific instructions
  if (concise) {
    parts.push(
      [
        "Make this translation more concise. The previous translation was:",
        previousTranslation,
        "",
        "You may:",
        "- Remove redundant expressions and filler words",
        "- Simplify sentence structures",
        "- Omit minor details that don't change the core message",
        "- Prioritize brevity over completeness",
      ].join("\n"),
    )
  } else if (context.length > 0) {
    // Normal translation: show source+translation pairs as context
    const pairs = context
      .slice(-5)
      .map((pair) => `Original: ${pair.source}\nTranslation: ${pair.translation}`)
    parts.push(`Previous translations for reference:\n${pairs.join("\n---\n")}`)
  }

  // Text to translate
  parts.push(`Text to translate:\n${text}`)

  return parts.join("\n\n")
}

export function getSystemMessages(): Array<{ role: "system"; content: string }> {
  return [{ role: "system", content: SYSTEM_PROMPT }]
}
