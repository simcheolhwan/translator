import { GoogleGenAI } from "@google/genai"
import type { Model } from "../shared/constants.js"
import { buildTranslatePrompt, getSystemMessages } from "../prompts/translate.js"
import { SESSION_METADATA_PROMPT } from "../prompts/metadata.js"
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
      systemInstruction: SESSION_METADATA_PROMPT,
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
