import { onRequest } from "firebase-functions/v2/https"
import { corsMiddleware } from "../../middleware/cors.js"
import { authMiddleware } from "../../middleware/auth.js"
import { allowedEmailsMiddleware } from "../../middleware/allowedEmails.js"
import { getSession } from "../../services/database.js"
import { initializeFirebase } from "../../services/firebase.js"
import { FUNCTION_REGION } from "../../lib/constants.js"
import type { AuthenticatedRequest } from "../../types/request.js"

export const getSessionFunction = onRequest(
  { region: FUNCTION_REGION, cors: false },
  async (req, res) => {
    initializeFirebase()

    corsMiddleware(req, res, async () => {
      if (req.method !== "GET") {
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

            const session = await getSession(authReq.user.uid, sessionId)

            if (!session) {
              res.status(404).json({ error: "Session not found" })
              return
            }

            // Convert messages object to array
            const messages = Object.entries(session.messages).map(([id, msg]) => ({
              ...msg,
              id,
            }))
            messages.sort((a, b) => a.createdAt - b.createdAt)

            res.json({
              ...session,
              messages,
            })
          } catch (error) {
            console.error("Get session error:", error)
            res.status(500).json({ error: "Failed to get session" })
          }
        })
      })
    })
  },
)
