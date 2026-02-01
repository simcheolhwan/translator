import { api } from "./client"

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete("deleteSession", { searchParams: { sessionId } })
}

export async function clearAllSessions(): Promise<void> {
  await api.delete("clearAllSessions")
}
