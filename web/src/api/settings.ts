import { api } from "./client"
import type { UserSettings } from "@/types/settings"

export async function getSettings(): Promise<UserSettings> {
  const response = await api.get("getSettings").json<{ settings: UserSettings }>()
  return response.settings
}

export async function updateSettings(globalInstruction: string): Promise<UserSettings> {
  const response = await api
    .put("updateSettings", { json: { globalInstruction } })
    .json<{ settings: UserSettings }>()
  return response.settings
}
