import type { Request } from "firebase-functions/v2/https"
import { getFirebaseAuth } from "../services/firebase.js"
import type { AuthenticatedRequest } from "../types/request.js"

type NextFunction = () => void | Promise<void>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResponseLike = any

export async function authMiddleware(
  req: Request,
  res: ResponseLike,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" })
    return
  }

  const idToken = authHeader.split("Bearer ")[1]

  try {
    const auth = getFirebaseAuth()
    const decodedToken = await auth.verifyIdToken(idToken)

    if (!decodedToken.email) {
      res.status(401).json({ error: "User email not found" })
      return
    }

    // Attach user info to request
    ;(req as AuthenticatedRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    }

    await next()
  } catch (error) {
    console.error("Auth error:", error)
    res.status(401).json({ error: "Invalid token" })
  }
}
