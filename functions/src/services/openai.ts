import OpenAI from "openai"
import { buildTranslatePrompt, getSystemMessages } from "../prompts/translate.js"
import type { TranslateOptions, SessionMetadata } from "./llm.js"

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
  model: string,
): Promise<SessionMetadata> {
  const client = getClient(apiKey)

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `Analyze the text and respond in JSON format.
- description: A concise description of the text content in Korean (max 50 characters)
- username: Extract the author/speaker name if present, otherwise null

Example: {"description": "제품 출시 일정과 마케팅 전략 회의", "username": "김철수"}
Example: {"description": "최신 SF 영화에 대한 상세 리뷰", "username": null}`,
      },
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
