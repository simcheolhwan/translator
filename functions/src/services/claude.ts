import Anthropic from "@anthropic-ai/sdk"
import type { Model } from "../shared/constants.js"
import { buildTranslatePrompt, getSystemMessages } from "../prompts/translate.js"
import { GRAMMAR_CHECK_SYSTEM_PROMPT, buildGrammarCheckPrompt } from "../prompts/grammar.js"
import { SESSION_METADATA_PROMPT } from "../prompts/metadata.js"
import type { TranslateOptions, GrammarCheckOptions, SessionMetadata } from "./llm.js"

let anthropicClient: Anthropic | null = null

function getClient(apiKey: string): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey })
  }
  return anthropicClient
}

export async function grammarCheck(options: GrammarCheckOptions): Promise<string> {
  const { apiKey, text, model } = options
  const client = getClient(apiKey)

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: GRAMMAR_CHECK_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildGrammarCheckPrompt(text) }],
  })

  const block = response.content[0]
  if (!block || block.type !== "text") {
    throw new Error("No response received from Claude")
  }

  return block.text.trim()
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

  const systemMessages = getSystemMessages()

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemMessages.map((m) => m.content).join("\n"),
    messages: [{ role: "user", content: userPrompt }],
  })

  const block = response.content[0]
  if (!block || block.type !== "text") {
    throw new Error("No translation received from Claude")
  }

  return block.text.trim()
}

export async function generateSessionMetadata(
  apiKey: string,
  text: string,
  model: Model,
): Promise<SessionMetadata> {
  const client = getClient(apiKey)

  const response = await client.messages.create({
    model,
    max_tokens: 100,
    system: SESSION_METADATA_PROMPT,
    messages: [{ role: "user", content: text }],
  })

  const block = response.content[0]
  const content = block?.type === "text" ? block.text : "{}"
  const parsed = JSON.parse(content)

  return {
    description: parsed.description || text.slice(0, 50),
    username: parsed.username || undefined,
  }
}
