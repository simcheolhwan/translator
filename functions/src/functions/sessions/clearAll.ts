import { onRequest } from "firebase-functions/v2/https"
import { authMiddleware } from "../../middleware/auth.js"
import { allowedEmailsMiddleware } from "../../middleware/allowedEmails.js"
import { clearAllSessions } from "../../services/database.js"
import { initializeFirebase } from "../../services/firebase.js"
import { FUNCTION_REGION } from "../../lib/constants.js"
import type { AuthenticatedRequest } from "../../types/request.js"

export const clearAllSessionsFunction = onRequest(
  { region: FUNCTION_REGION, cors: true },
  async (req, res) => {
    initializeFirebase()

    if (req.method !== "DELETE") {
      res.status(405).json({ error: "Method not allowed" })
      return
    }

    await authMiddleware(req, res, async () => {
      await allowedEmailsMiddleware(req as AuthenticatedRequest, res, async () => {
        try {
          const authReq = req as AuthenticatedRequest
          await clearAllSessions(authReq.user.uid)
          res.json({ success: true })
        } catch (error) {
          console.error("Clear all sessions error:", error)
          res.status(500).json({ error: "Failed to clear sessions" })
        }
      })
    })
  },
)
