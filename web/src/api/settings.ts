import { ref, get, set } from "firebase/database"
import { database, auth } from "@/lib/firebase"
import type { UserSettings } from "functions/types"

export async function getSettings(): Promise<UserSettings> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Not authenticated")
  const snapshot = await get(ref(database, `users/${uid}/settings`))
  if (!snapshot.exists()) {
    return { globalInstruction: "", createdAt: Date.now(), updatedAt: Date.now() }
  }
  return snapshot.val()
}

export async function updateSettings(globalInstruction: string): Promise<UserSettings> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Not authenticated")
  const existing = await getSettings()
  const now = Date.now()
  const settings: UserSettings = {
    globalInstruction,
    createdAt: existing.createdAt ?? now,
    updatedAt: now,
  }
  await set(ref(database, `users/${uid}/settings`), settings)
  return settings
}
