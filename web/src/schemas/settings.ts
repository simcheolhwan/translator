import { z } from "zod"

export const userSettingsSchema = z.object({
  globalInstruction: z.string().max(5000, "Instruction too long"),
})

export type UserSettingsSchema = z.infer<typeof userSettingsSchema>
