import type { ToneSettings, Model } from "@/lib/constants"

export interface Message {
  id: string
  type: "source" | "translation"
  content: string
  model?: Model
  tone?: ToneSettings
  parentId?: string // For re-translations
  createdAt: number
}

export interface Session {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface SessionListItem {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}
