import { onRequest } from "firebase-functions/v2/https"
import { toneSettingsSchema } from "../shared/schemas/index.js"
import { MODELS } from "../shared/constants.js"
import type { Model } from "../shared/constants.js"
import type { BenchmarkResult } from "../shared/types/benchmark.js"
import { z } from "zod"
import { authMiddleware } from "../middleware/auth.js"
import { allowedEmailsMiddleware } from "../middleware/allowedEmails.js"
import { openaiApiKey, claudeApiKey, geminiApiKey } from "../lib/config.js"
import { FUNCTION_REGION } from "../lib/constants.js"
import { getApiKey } from "../lib/apiKeys.js"
import { translate } from "../services/llm.js"
import { initializeFirebase } from "../services/firebase.js"
import type { AuthenticatedRequest } from "../types/request.js"

const benchmarkSchema = z.object({
  text: z.string().min(1),
  isKorean: z.boolean(),
  models: z.array(z.enum(MODELS)).min(1),
  tone: toneSettingsSchema,
})

async function translateWithTiming(
  apiKey: string,
  text: string,
  isKorean: boolean,
  model: Model,
  tone: z.infer<typeof toneSettingsSchema>,
): Promise<BenchmarkResult> {
  const start = performance.now()
  try {
    const translation = await translate({
      apiKey,
      text,
      isKorean,
      model,
      tone,
      context: [],
    })
    const durationMs = Math.round(performance.now() - start)
    return { model, translation, durationMs }
  } catch (error) {
    const durationMs = Math.round(performance.now() - start)
    return {
      model,
      translation: "",
      durationMs,
      error: error instanceof Error ? error.message : "Translation failed",
    }
  }
}

export const benchmarkFunction = onRequest(
  {
    region: FUNCTION_REGION,
    secrets: [openaiApiKey, claudeApiKey, geminiApiKey],
    cors: true,
    timeoutSeconds: 120,
  },
  async (req, res) => {
    initializeFirebase()

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" })
      return
    }

    await authMiddleware(req, res, async () => {
      await allowedEmailsMiddleware(req as AuthenticatedRequest, res, async () => {
        try {
          const parseResult = benchmarkSchema.safeParse(req.body)
          if (!parseResult.success) {
            res.status(400).json({
              error: "Invalid request",
              details: parseResult.error.issues,
            })
            return
          }

          const { text, isKorean, models, tone } = parseResult.data

          const results = await Promise.allSettled(
            models.map((model) =>
              translateWithTiming(getApiKey(model), text, isKorean, model, tone),
            ),
          )

          const benchmarkResults: BenchmarkResult[] = results.map((result, i) => {
            if (result.status === "fulfilled") return result.value
            return {
              model: models[i],
              translation: "",
              durationMs: 0,
              error: result.reason instanceof Error ? result.reason.message : "Unknown error",
            }
          })

          res.json({ results: benchmarkResults })
        } catch (error) {
          console.error("Benchmark error:", error)
          res.status(500).json({
            error: "Benchmark failed",
            message: error instanceof Error ? error.message : "Unknown error",
          })
        }
      })
    })
  },
)
