import { onRequest } from "firebase-functions/v2/https"
import { toneSettingsSchema } from "shared/schemas"
import {
  MODELS,
  DEFAULT_MODEL,
  DEFAULT_TONE,
  type Model,
  type ToneSettings,
} from "shared/constants"
import { z } from "zod"
import { authMiddleware } from "../middleware/auth.js"
import { allowedEmailsMiddleware } from "../middleware/allowedEmails.js"
import { openaiApiKey } from "../lib/config.js"
import { FUNCTION_REGION } from "../lib/constants.js"
import { translate, generateSessionMetadata } from "../services/openai.js"
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

interface TranslateInBackgroundParams {
  apiKey: string
  userId: string
  sessionId: string
  messageId: string
  text: string
  isKorean: boolean
  model: Model
  tone: ToneSettings
  concise?: boolean
  parentMessageId?: string
}

async function translateInBackground(params: TranslateInBackgroundParams): Promise<void> {
  const {
    apiKey,
    userId,
    sessionId,
    messageId,
    text,
    isKorean,
    model,
    tone,
    concise,
    parentMessageId,
  } = params

  try {
    const settings = await getUserSettings(userId)

    let previousTranslation: string | undefined
    let context = await getTranslationContext(userId, sessionId)

    if (concise) {
      previousTranslation = await getMessageContent(userId, sessionId, parentMessageId!)
      context = []
    }

    const translatedText = await translate({
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

    await updateMessage(userId, sessionId, messageId, {
      content: translatedText,
      status: "completed",
    })
  } catch (error) {
    await updateMessage(userId, sessionId, messageId, {
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Translation failed",
    })
  }
}

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

          const { text, isKorean, model, tone, concise, parentMessageId } = parseResult.data
          let { sessionId } = parseResult.data

          // Create new session if not provided
          if (!sessionId) {
            // Create session immediately with empty description
            const session = await createSession(userId, { description: "" })
            sessionId = session.id

            // Generate metadata in background and update session (no await)
            generateSessionMetadata(openaiApiKey.value(), text, model)
              .then((metadata) => updateSessionMetadata(userId, sessionId!, metadata))
              .catch(console.error)
          }

          // Save source message only for new translations (not retranslate)
          let sourceMessageId: string | undefined
          if (!parentMessageId) {
            const sourceMessage = await addMessage(userId, sessionId, {
              type: "source",
              content: text,
              status: "completed",
              createdAt: Date.now(),
            })
            sourceMessageId = sourceMessage.id
          }

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

          // Respond immediately with session and message IDs
          res.json({
            sessionId,
            sourceMessageId,
            translationMessageId: translationMessage.id,
          })

          // Perform translation in background (no await)
          translateInBackground({
            apiKey: openaiApiKey.value(),
            userId,
            sessionId,
            messageId: translationMessage.id,
            text,
            isKorean,
            model,
            tone,
            concise,
            parentMessageId,
          }).catch(console.error)
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
