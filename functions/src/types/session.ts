import type { Session, Message } from "shared/types"

export interface SessionWithMessages extends Session {
  messages: Record<string, Message>
}
