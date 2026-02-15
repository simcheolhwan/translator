import { onRequest } from "firebase-functions/v2/https"
import { toneSettingsSchema } from "../shared/schemas/index.js"
import { MODELS, DEFAULT_MODEL, DEFAULT_TONE } from "../shared/constants.js"
import { z } from "zod"
import { authMiddleware } from "../middleware/auth.js"
import { allowedEmailsMiddleware } from "../middleware/allowedEmails.js"
import { openaiApiKey, claudeApiKey, geminiApiKey } from "../lib/config.js"
import { FUNCTION_REGION } from "../lib/constants.js"
import { getApiKey } from "../lib/apiKeys.js"
import { translate, generateSessionMetadata } from "../services/llm.js"
import {
  createSession,
  addMessage,
  updateMessage,
  updateSessionMetadata,
  getTranslationContext,
  getMessageContent,
  getUserSettings,
} from "../services/database.js"
import { initializeFirebase } from "../services/firebase.js"
import type { AuthenticatedRequest } from "../types/request.js"

const translateSchema = z.object({
  sessionId: z.string().optional(),
  text: z.string().min(1),
  isKorean: z.boolean(),
  model: z.enum(MODELS).default(DEFAULT_MODEL),
  tone: toneSettingsSchema.default(DEFAULT_TONE),
  concise: z.boolean().optional(),
  parentMessageId: z.string().optional(),
})

export const translateFunction = onRequest(
  { region: FUNCTION_REGION, secrets: [openaiApiKey, claudeApiKey, geminiApiKey], cors: true },
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

          const { text, isKorean, model, tone, concise, parentMessageId } = parseResult.data
          let { sessionId } = parseResult.data

          // Create new session if not provided
          const isNewSession = !sessionId
          if (isNewSession) {
            // push() generates the key locally (synchronous), set() is async
            const session = await createSession(userId, { description: "" })
            sessionId = session.id
          }

          const now = Date.now()
          const apiKey = getApiKey(model)

          // Start DB writes (no await — run in parallel)
          const sourceMessagePromise = !parentMessageId
            ? addMessage(userId, sessionId!, {
                type: "source",
                content: text,
                status: "completed",
                createdAt: now,
              })
            : null

          const translationMessagePromise = addMessage(userId, sessionId!, {
            type: "translation",
            content: "",
            status: "pending",
            model,
            tone,
            parentId: parentMessageId,
            createdAt: now + 1,
          })

          // Start translation in parallel with DB writes
          // DB reads (settings, context) are also parallelized with each other
          const translationPromise = (async () => {
            const [settings, context, previousTranslation] = await Promise.all([
              getUserSettings(userId),
              concise ? Promise.resolve([]) : getTranslationContext(userId, sessionId!),
              concise
                ? getMessageContent(userId, sessionId!, parentMessageId!)
                : Promise.resolve(undefined),
            ])

            const start = performance.now()
            const result = await translate({
              apiKey,
              text,
              isKorean,
              model,
              tone,
              context,
              userInstruction: settings?.globalInstruction,
              concise,
              previousTranslation,
            })
            const durationMs = Math.round(performance.now() - start)
            return { result, durationMs }
          })()

          // Generate metadata in background for new sessions
          if (isNewSession) {
            generateSessionMetadata(apiKey, text, model)
              .then((metadata) => updateSessionMetadata(userId, sessionId!, metadata))
              .catch(console.error)
          }

          // Wait for message IDs to respond to client
          const [translationMessage, sourceMessage] = await Promise.all([
            translationMessagePromise,
            sourceMessagePromise ?? Promise.resolve(null),
          ])

          res.json({
            sessionId,
            sourceMessageId: sourceMessage?.id,
            translationMessageId: translationMessage.id,
          })

          // Update message when translation completes (background)
          translationPromise
            .then(
              async ({ result: translatedText, durationMs }) => {
                await updateMessage(userId, sessionId!, translationMessage.id, {
                  content: translatedText,
                  status: "completed",
                  durationMs,
                })
              },
              async (error) => {
                await updateMessage(userId, sessionId!, translationMessage.id, {
                  status: "error",
                  errorMessage: error instanceof Error ? error.message : "Translation failed",
                })
              },
            )
            .catch(console.error)
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
