import { onRequest } from "firebase-functions/v2/https"
import { authMiddleware } from "../../middleware/auth.js"
import { allowedEmailsMiddleware } from "../../middleware/allowedEmails.js"
import { getUserSettings } from "../../services/database.js"
import { initializeFirebase } from "../../services/firebase.js"
import { FUNCTION_REGION } from "../../lib/constants.js"
import type { AuthenticatedRequest } from "../../types/request.js"

export const getSettingsFunction = onRequest(
  { region: FUNCTION_REGION, cors: true },
  async (req, res) => {
    initializeFirebase()

    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" })
      return
    }

    await authMiddleware(req, res, async () => {
      await allowedEmailsMiddleware(req as AuthenticatedRequest, res, async () => {
        try {
          const authReq = req as AuthenticatedRequest
          const settings = await getUserSettings(authReq.user.uid)

          res.json({
            settings: settings ?? {
              globalInstruction: "",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          })
        } catch (error) {
          console.error("Get settings error:", error)
          res.status(500).json({ error: "Failed to get settings" })
        }
      })
    })
  },
)
