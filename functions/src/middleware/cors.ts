import cors from "cors"

// Allow CORS for all origins in development
// In production, restrict to specific origins if needed
export const corsMiddleware = cors({ origin: true })
