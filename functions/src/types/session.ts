import type { ToneSettings, Model } from "../lib/constants.js"

export type MessageStatus = "pending" | "completed" | "error"

export interface Message {
  id: string
  type: "source" | "translation"
  content: string
  status: MessageStatus
  model?: Model
  tone?: ToneSettings
  parentId?: string
  createdAt: number
  errorMessage?: string
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
