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

          // Generate message IDs and start all work in parallel
          const now = Date.now()
          const apiKey = getApiKey(model)

          // Prepare source and translation message data
          let sourceMessageId: string | undefined
          const dbWrites: Promise<unknown>[] = []

          if (!parentMessageId) {
            const sourceMessage = addMessage(userId, sessionId!, {
              type: "source",
              content: text,
              status: "completed",
              createdAt: now,
            })
            dbWrites.push(
              sourceMessage.then((m) => {
                sourceMessageId = m.id
              }),
            )
          }

          const translationMessagePromise = addMessage(userId, sessionId!, {
            type: "translation",
            content: "",
            status: "pending",
            model,
            tone,
            parentId: parentMessageId,
            createdAt: now + 1,
          })
          dbWrites.push(translationMessagePromise)

          // Start translation immediately in parallel with DB writes
          const translationPromise = (async () => {
            try {
              const settings = await getUserSettings(userId)

              let previousTranslation: string | undefined
              let context = await getTranslationContext(userId, sessionId!)

              if (concise) {
                previousTranslation = await getMessageContent(userId, sessionId!, parentMessageId!)
                context = []
              }

              return await translate({
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
            } catch (error) {
              return { error }
            }
          })()

          // Generate metadata in background for new sessions
          if (isNewSession) {
            generateSessionMetadata(apiKey, text, model)
              .then((metadata) => updateSessionMetadata(userId, sessionId!, metadata))
              .catch(console.error)
          }

          // Wait for message IDs to be ready for response
          const [translationMessage] = await Promise.all([translationMessagePromise, ...dbWrites])

          // Respond immediately with session and message IDs
          res.json({
            sessionId,
            sourceMessageId,
            translationMessageId: translationMessage.id,
          })

          // Wait for translation to complete and update message
          translationPromise
            .then(async (result) => {
              if (result && typeof result === "object" && "error" in result) {
                const error = (result as { error: unknown }).error
                await updateMessage(userId, sessionId!, translationMessage.id, {
                  status: "error",
                  errorMessage: error instanceof Error ? error.message : "Translation failed",
                })
              } else {
                await updateMessage(userId, sessionId!, translationMessage.id, {
                  content: result as string,
                  status: "completed",
                })
              }
            })
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
