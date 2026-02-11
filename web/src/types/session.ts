import type { Session as SessionBase, Message } from "functions/types"

export interface Session extends SessionBase {
  messages: Message[]
}

export type SessionListItem = SessionBase
