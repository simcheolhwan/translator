import type { Request } from "firebase-functions/v2/https"

export interface AuthenticatedRequest extends Request {
  user: {
    uid: string
    email: string
  }
}
