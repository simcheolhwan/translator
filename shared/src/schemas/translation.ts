import { z } from "zod"
import { MODELS, TONE_OPTIONS } from "../constants.js"

export const toneSettingsSchema = z.object({
  translationStyle: z.enum(TONE_OPTIONS.translationStyle),
  formality: z.enum(TONE_OPTIONS.formality),
  domain: z.enum(TONE_OPTIONS.domain),
})

export const translateRequestSchema = z.object({
  sessionId: z.string().optional(),
  text: z.string().min(1, "Text is required"),
  isKorean: z.boolean(),
  model: z.enum(MODELS),
  tone: toneSettingsSchema,
  concise: z.boolean().optional(),
  parentMessageId: z.string().optional(),
})

export type TranslateRequestSchema = z.infer<typeof translateRequestSchema>
