import Anthropic from "@anthropic-ai/sdk"
import type { Model } from "../shared/constants.js"
import { buildTranslatePrompt, getSystemMessages } from "../prompts/translate.js"
import type { TranslateOptions, SessionMetadata } from "./llm.js"

let anthropicClient: Anthropic | null = null

function getClient(apiKey: string): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey })
  }
  return anthropicClient
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
    system: `Analyze the text and respond in JSON format.
- description: A concise description of the text content in Korean (max 50 characters)
- username: Extract the author/speaker name if present, otherwise null

Example: {"description": "제품 출시 일정과 마케팅 전략 회의", "username": "김철수"}
Example: {"description": "최신 SF 영화에 대한 상세 리뷰", "username": null}`,
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
