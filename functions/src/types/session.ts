import type { ToneSettings, Model } from "../lib/constants.js"

export interface Message {
  id: string
  type: "source" | "translation"
  content: string
  model?: Model
  tone?: ToneSettings
  parentId?: string
  createdAt: number
}

export interface Session {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

export interface SessionWithMessages extends Session {
  messages: Record<string, Message>
}
