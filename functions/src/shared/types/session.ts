import type { ToneSettings, Model } from "../constants.js"

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
  username?: string
  description: string
  createdAt: number
  updatedAt: number
}

export interface UserSettings {
  globalInstruction: string
  createdAt: number
  updatedAt: number
}
