import { onRequest } from "firebase-functions/v2/https"
import { z } from "zod"
import { corsMiddleware } from "../../middleware/cors.js"
import { authMiddleware } from "../../middleware/auth.js"
import { allowedEmailsMiddleware } from "../../middleware/allowedEmails.js"
import { updateUserSettings } from "../../services/database.js"
import { initializeFirebase } from "../../services/firebase.js"
import { FUNCTION_REGION } from "../../lib/constants.js"
import type { AuthenticatedRequest } from "../../types/request.js"

const updateSettingsSchema = z.object({
  globalInstruction: z.string().max(5000),
})

export const updateSettingsFunction = onRequest(
  { region: FUNCTION_REGION, cors: false },
  async (req, res) => {
    initializeFirebase()

    corsMiddleware(req, res, async () => {
      if (req.method !== "PUT") {
        res.status(405).json({ error: "Method not allowed" })
        return
      }

      await authMiddleware(req, res, async () => {
        await allowedEmailsMiddleware(req as AuthenticatedRequest, res, async () => {
          try {
            const authReq = req as AuthenticatedRequest

            const parseResult = updateSettingsSchema.safeParse(req.body)
            if (!parseResult.success) {
              res.status(400).json({
                error: "Invalid request",
                details: parseResult.error.issues,
              })
              return
            }

            const { globalInstruction } = parseResult.data
            const settings = await updateUserSettings(authReq.user.uid, globalInstruction)

            res.json({ settings })
          } catch (error) {
            console.error("Update settings error:", error)
            res.status(500).json({ error: "Failed to update settings" })
          }
        })
      })
    })
  },
)
