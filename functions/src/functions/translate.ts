import { onRequest } from "firebase-functions/v2/https"
import { z } from "zod"
import { authMiddleware } from "../middleware/auth.js"
import { allowedEmailsMiddleware } from "../middleware/allowedEmails.js"
import { openaiApiKey } from "../lib/config.js"
import {
  FUNCTION_REGION,
  MODELS,
  TONE_SETTINGS,
  DEFAULT_MODEL,
  DEFAULT_TONE,
} from "../lib/constants.js"
import { translate } from "../services/openai.js"
import {
  createSession,
  addMessage,
  updateMessage,
  getTranslationContext,
  getUserSettings,
} from "../services/database.js"
import { initializeFirebase } from "../services/firebase.js"
import type { AuthenticatedRequest } from "../types/request.js"

const translateSchema = z.object({
  sessionId: z.string().optional(),
  text: z.string().min(1),
  model: z.enum(MODELS).default(DEFAULT_MODEL),
  tone: z
    .object({
      translationStyle: z.enum(TONE_SETTINGS.translationStyle),
      formality: z.enum(TONE_SETTINGS.formality),
      domain: z.enum(TONE_SETTINGS.domain),
    })
    .default(DEFAULT_TONE),
  concise: z.boolean().optional(),
  parentMessageId: z.string().optional(),
})

export const translateFunction = onRequest(
  { region: FUNCTION_REGION, secrets: [openaiApiKey], cors: true },
  async (req, res) => {
    // Initialize Firebase
    initializeFirebase()

    // Check method
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" })
      return
    }

    // Auth middleware
    await authMiddleware(req, res, async () => {
      // Email whitelist check
      await allowedEmailsMiddleware(req as AuthenticatedRequest, res, async () => {
        try {
          const authReq = req as AuthenticatedRequest
          const userId = authReq.user.uid

          // Validate request body
          const parseResult = translateSchema.safeParse(req.body)
          if (!parseResult.success) {
            res.status(400).json({
              error: "Invalid request",
              details: parseResult.error.issues,
            })
            return
          }

          const { text, model, tone, concise, parentMessageId } = parseResult.data
          let { sessionId } = parseResult.data

          // Create new session if not provided
          if (!sessionId) {
            const title = text.slice(0, 50) + (text.length > 50 ? "..." : "")
            const session = await createSession(userId, title)
            sessionId = session.id
          }

          // Save source message immediately (status: completed)
          const sourceMessage = await addMessage(userId, sessionId, {
            type: "source",
            content: text,
            status: "completed",
            createdAt: Date.now(),
          })

          // Save translation message immediately (status: pending)
          const translationMessage = await addMessage(userId, sessionId, {
            type: "translation",
            content: "",
            status: "pending",
            model,
            tone,
            parentId: parentMessageId,
            createdAt: Date.now(),
          })

          try {
            // Get translation context (previous translations in session)
            const context = await getTranslationContext(userId, sessionId)

            // Get user's global instruction
            const settings = await getUserSettings(userId)
            const userInstruction = settings?.globalInstruction

            // Perform translation
            const translatedText = await translate({
              apiKey: openaiApiKey.value(),
              text,
              model,
              tone,
              context,
              userInstruction,
              concise,
            })

            // Update translation message to completed
            await updateMessage(userId, sessionId, translationMessage.id, {
              content: translatedText,
              status: "completed",
            })

            res.json({
              sessionId,
              sourceMessageId: sourceMessage.id,
              translationMessageId: translationMessage.id,
              translatedText,
            })
          } catch (translationError) {
            // Update translation message to error
            await updateMessage(userId, sessionId, translationMessage.id, {
              status: "error",
              errorMessage:
                translationError instanceof Error ? translationError.message : "Translation failed",
            })
            throw translationError
          }
        } catch (error) {
          console.error("Translation error:", error)
          res.status(500).json({
            error: "Translation failed",
            message: error instanceof Error ? error.message : "Unknown error",
          })
        }
      })
    })
  },
)
