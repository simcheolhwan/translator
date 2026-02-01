import type { ToneSettings, Model } from "@/lib/constants"

export type MessageStatus = "pending" | "completed" | "error"

export interface Message {
  id: string
  type: "source" | "translation"
  content: string
  status: MessageStatus
  model?: Model
  tone?: ToneSettings
  parentId?: string // For re-translations
  createdAt: number
  errorMessage?: string
}

export interface Session {
  id: string
  username?: string
  description: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface SessionListItem {
  id: string
  username?: string
  description: string
  createdAt: number
  updatedAt: number
}
