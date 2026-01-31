import OpenAI from "openai"
import type { Model, ToneSettings } from "../lib/constants.js"
import { buildTranslatePrompt, getSystemMessages } from "../prompts/translate.js"

let openaiClient: OpenAI | null = null

export function getOpenAIClient(apiKey: string): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

interface TranslateOptions {
  apiKey: string
  text: string
  model: Model
  tone: ToneSettings
  context: string[]
  userInstruction?: string
  concise?: boolean
}

export async function translate(options: TranslateOptions): Promise<string> {
  const { apiKey, text, model, tone, context, userInstruction, concise } = options

  const client = getOpenAIClient(apiKey)

  const userPrompt = buildTranslatePrompt({
    text,
    tone,
    context,
    userInstruction,
    concise,
  })

  const response = await client.chat.completions.create({
    model,
    messages: [...getSystemMessages(), { role: "user", content: userPrompt }],
    temperature: 0.3,
    max_tokens: 4096,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("No translation received from OpenAI")
  }

  return content.trim()
}
