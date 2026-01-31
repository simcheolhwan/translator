import { getConfig } from "../lib/config.js"
import type { AuthenticatedRequest } from "../types/request.js"

type NextFunction = () => void | Promise<void>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResponseLike = any

export async function allowedEmailsMiddleware(
  req: AuthenticatedRequest,
  res: ResponseLike,
  next: NextFunction,
): Promise<void> {
  const { allowedEmails } = getConfig()

  // If no allowed emails configured, allow all authenticated users
  if (allowedEmails.length === 0) {
    await next()
    return
  }

  const userEmail = req.user.email.toLowerCase()

  if (!allowedEmails.includes(userEmail)) {
    res.status(403).json({ error: "Access denied. Email not in allowed list." })
    return
  }

  await next()
}
