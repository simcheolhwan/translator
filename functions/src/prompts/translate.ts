import type { ToneSettings } from "../lib/constants.js"
import { SYSTEM_PROMPT } from "./system.js"

interface TranslatePromptOptions {
  text: string
  tone: ToneSettings
  context: string[]
  userInstruction?: string
  concise?: boolean
}

export function buildTranslatePrompt(options: TranslatePromptOptions): string {
  const { text, tone, context, userInstruction, concise } = options

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

  if (concise) {
    styleLines.push("- Make the translation more concise while preserving meaning")
  }

  parts.push(`Style settings:\n${styleLines.join("\n")}`)

  // User instruction
  if (userInstruction?.trim()) {
    parts.push(`User instruction:\n${userInstruction}`)
  }

  // Previous context (translation outputs only)
  if (context.length > 0) {
    const contextText = context.slice(-5).join("\n---\n") // Last 5 translations
    parts.push(`Previous translations for context:\n${contextText}`)
  }

  // Text to translate
  parts.push(`Text to translate:\n${text}`)

  return parts.join("\n\n")
}

export function getSystemMessages(): Array<{ role: "system"; content: string }> {
  return [{ role: "system", content: SYSTEM_PROMPT }]
}
