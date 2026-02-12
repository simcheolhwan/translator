import { GoogleGenAI } from "@google/genai"
import type { Model } from "../shared/constants.js"
import { buildTranslatePrompt, getSystemMessages } from "../prompts/translate.js"
import type { TranslateOptions, SessionMetadata } from "./llm.js"

let genaiClient: GoogleGenAI | null = null

function getClient(apiKey: string): GoogleGenAI {
  if (!genaiClient) {
    genaiClient = new GoogleGenAI({ apiKey })
  }
  return genaiClient
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

  const response = await client.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction: systemMessages.map((m) => m.content).join("\n"),
      maxOutputTokens: 4096,
    },
  })

  const content = response.text
  if (!content) {
    throw new Error("No translation received from Gemini")
  }

  return content.trim()
}

export async function generateSessionMetadata(
  apiKey: string,
  text: string,
  model: Model,
): Promise<SessionMetadata> {
  const client = getClient(apiKey)

  const response = await client.models.generateContent({
    model,
    contents: text,
    config: {
      systemInstruction: `Analyze the text and respond in JSON format.
- description: A concise description of the text content in Korean (max 50 characters)
- username: Extract the author/speaker name if present, otherwise null

Example: {"description": "제품 출시 일정과 마케팅 전략 회의", "username": "김철수"}
Example: {"description": "최신 SF 영화에 대한 상세 리뷰", "username": null}`,
      responseMimeType: "application/json",
      maxOutputTokens: 100,
    },
  })

  const content = response.text || "{}"
  const parsed = JSON.parse(content)

  return {
    description: parsed.description || text.slice(0, 50),
    username: parsed.username || undefined,
  }
}
