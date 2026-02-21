import OpenAI from "openai"
import type { Model } from "../shared/constants.js"
import { buildTranslatePrompt, getSystemMessages } from "../prompts/translate.js"
import { GRAMMAR_CHECK_SYSTEM_PROMPT, buildGrammarCheckPrompt } from "../prompts/grammar.js"
import { SESSION_METADATA_PROMPT } from "../prompts/metadata.js"
import type { TranslateOptions, GrammarCheckOptions, SessionMetadata } from "./llm.js"

let openaiClient: OpenAI | null = null

function getClient(apiKey: string): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

export async function generateSessionMetadata(
  apiKey: string,
  text: string,
  model: Model,
): Promise<SessionMetadata> {
  const client = getClient(apiKey)

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SESSION_METADATA_PROMPT },
      { role: "user", content: text },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 100,
  })

  const content = response.choices[0]?.message?.content
  const parsed = JSON.parse(content || "{}")

  return {
    description: parsed.description || text.slice(0, 50),
    username: parsed.username || undefined,
  }
}

export async function grammarCheck(options: GrammarCheckOptions): Promise<string> {
  const { apiKey, text, model } = options
  const client = getClient(apiKey)

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: GRAMMAR_CHECK_SYSTEM_PROMPT },
      { role: "user", content: buildGrammarCheckPrompt(text) },
    ],
    max_completion_tokens: 4096,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("No response received from OpenAI")
  }

  return content.trim()
}

export async function translate(options: TranslateOptions): Promise<string> {
  const {
    apiKey,
    text,
    isKorean,
    model,
    tone,
    context,
    userInstruction,
    concise,
    previousTranslation,
  } = options

  const client = getClient(apiKey)

  const userPrompt = buildTranslatePrompt({
    text,
    isKorean,
    tone,
    context,
    userInstruction,
    concise,
    previousTranslation,
  })

  const response = await client.chat.completions.create({
    model,
    messages: [...getSystemMessages(), { role: "user", content: userPrompt }],
    max_completion_tokens: 4096,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("No translation received from OpenAI")
  }

  return content.trim()
}
