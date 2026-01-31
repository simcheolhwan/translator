import { api } from "./client"
import type { Session, SessionListItem } from "@/types/session"

export async function listSessions(): Promise<SessionListItem[]> {
  const response = await api.get("listSessions").json<{ sessions: SessionListItem[] }>()
  return response.sessions
}

export async function getSession(sessionId: string): Promise<Session> {
  const response = await api.get("getSession", { searchParams: { sessionId } }).json<Session>()
  return response
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete("deleteSession", { searchParams: { sessionId } })
}

export async function clearAllSessions(): Promise<void> {
  await api.delete("clearAllSessions")
}
