import { ref, remove } from "firebase/database"
import { database, auth } from "@/lib/firebase"

export async function deleteSession(sessionId: string): Promise<void> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Not authenticated")
  await remove(ref(database, `users/${uid}/sessions/${sessionId}`))
}

export async function clearAllSessions(): Promise<void> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Not authenticated")
  await remove(ref(database, `users/${uid}/sessions`))
}
