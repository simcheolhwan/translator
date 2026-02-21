import { onRequest } from "firebase-functions/v2/https"
import { grammarCheckRequestSchema } from "../shared/schemas/index.js"
import { authMiddleware } from "../middleware/auth.js"
import { allowedEmailsMiddleware } from "../middleware/allowedEmails.js"
import { openaiApiKey, claudeApiKey, geminiApiKey } from "../lib/config.js"
import { FUNCTION_REGION } from "../lib/constants.js"
import { getApiKey } from "../lib/apiKeys.js"
import { grammarCheck } from "../services/llm.js"
import { initializeFirebase } from "../services/firebase.js"
import type { AuthenticatedRequest } from "../types/request.js"

function parseGrammarResponse(content: string): {
  corrected: string
  explanation: string | null
} {
  const SEPARATOR_LONG = "\n\n---\n\n"
  const SEPARATOR_SHORT = "\n---\n"

  let separatorIndex = content.indexOf(SEPARATOR_LONG)
  let separatorLength = SEPARATOR_LONG.length

  if (separatorIndex === -1) {
    separatorIndex = content.indexOf(SEPARATOR_SHORT)
    separatorLength = SEPARATOR_SHORT.length
  }

  if (separatorIndex === -1) {
    return { corrected: content.trim(), explanation: null }
  }

  return {
    corrected: content.slice(0, separatorIndex).trim(),
    explanation: content.slice(separatorIndex + separatorLength).trim() || null,
  }
}

export const grammarCheckFunction = onRequest(
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
          const parseResult = grammarCheckRequestSchema.safeParse(req.body)
          if (!parseResult.success) {
            res.status(400).json({
              error: "Invalid request",
              details: parseResult.error.issues,
            })
            return
          }

          const { text, model } = parseResult.data
          const apiKey = getApiKey(model)

          const start = performance.now()
          const result = await grammarCheck({ apiKey, text, model })
          const durationMs = Math.round(performance.now() - start)

          const { corrected, explanation } = parseGrammarResponse(result)

          res.json({ corrected, explanation, durationMs })
        } catch (error) {
          console.error("Grammar check error:", error)
          res.status(500).json({
            error: "Grammar check failed",
            message: error instanceof Error ? error.message : "Unknown error",
          })
        }
      })
    })
  },
)
