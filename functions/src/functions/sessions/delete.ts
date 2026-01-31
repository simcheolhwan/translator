import { onRequest } from "firebase-functions/v2/https"
import { corsMiddleware } from "../../middleware/cors.js"
import { authMiddleware } from "../../middleware/auth.js"
import { allowedEmailsMiddleware } from "../../middleware/allowedEmails.js"
import { deleteSession } from "../../services/database.js"
import { initializeFirebase } from "../../services/firebase.js"
import { FUNCTION_REGION } from "../../lib/constants.js"
import type { AuthenticatedRequest } from "../../types/request.js"

export const deleteSessionFunction = onRequest(
  { region: FUNCTION_REGION, cors: false },
  async (req, res) => {
    initializeFirebase()

    corsMiddleware(req, res, async () => {
      if (req.method !== "DELETE") {
        res.status(405).json({ error: "Method not allowed" })
        return
      }

      await authMiddleware(req, res, async () => {
        await allowedEmailsMiddleware(req as AuthenticatedRequest, res, async () => {
          try {
            const authReq = req as AuthenticatedRequest
            const sessionId = req.query.sessionId as string

            if (!sessionId) {
              res.status(400).json({ error: "sessionId is required" })
              return
            }

            await deleteSession(authReq.user.uid, sessionId)
            res.json({ success: true })
          } catch (error) {
            console.error("Delete session error:", error)
            res.status(500).json({ error: "Failed to delete session" })
          }
        })
      })
    })
  },
)
