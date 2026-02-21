import { z } from "zod"
import { MODELS, DEFAULT_MODEL } from "../constants.js"

export const grammarCheckRequestSchema = z.object({
  text: z.string().min(1, "Text is required"),
  model: z.enum(MODELS).default(DEFAULT_MODEL),
})
