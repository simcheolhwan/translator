import { onRequest } from "firebase-functions/v2/https"
import { authMiddleware } from "../../middleware/auth.js"
import { allowedEmailsMiddleware } from "../../middleware/allowedEmails.js"
import { listSessions } from "../../services/database.js"
import { initializeFirebase } from "../../services/firebase.js"
import { FUNCTION_REGION } from "../../lib/constants.js"
import type { AuthenticatedRequest } from "../../types/request.js"

export const listSessionsFunction = onRequest(
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
          const sessions = await listSessions(authReq.user.uid)
          res.json({ sessions })
        } catch (error) {
          console.error("List sessions error:", error)
          res.status(500).json({ error: "Failed to list sessions" })
        }
      })
    })
  },
)
