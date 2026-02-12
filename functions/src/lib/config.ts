import { defineSecret, defineString } from "firebase-functions/params"

// Secrets (for production)
export const openaiApiKey = defineSecret("OPENAI_API_KEY")
export const claudeApiKey = defineSecret("CLAUDE_API_KEY")
export const geminiApiKey = defineSecret("GEMINI_API_KEY")

// Config
export const allowedEmails = defineString("ALLOWED_EMAILS", {
  default: "",
  description: "Comma-separated list of allowed email addresses",
})

export function getConfig() {
  return {
    openaiApiKey: process.env.OPENAI_API_KEY || openaiApiKey.value(),
    allowedEmails: parseAllowedEmails(),
  }
}

function parseAllowedEmails(): string[] {
  const emails = process.env.ALLOWED_EMAILS || allowedEmails.value()
  if (!emails) return []
  return emails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}
