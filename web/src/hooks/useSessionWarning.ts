import { useMemo } from "react"
import { useSessionQuery } from "@/queries/sessions"
import { SESSION_WARNING_THRESHOLD, SESSION_MAX_CONTEXT_SIZE } from "@/lib/constants"

export function useSessionWarning(sessionId: string | undefined) {
  const { data: session } = useSessionQuery(sessionId ?? "")

  const { totalSize, percentage, showWarning } = useMemo(() => {
    if (!session?.messages) {
      return { totalSize: 0, percentage: 0, showWarning: false }
    }

    const size = session.messages
      .filter((m) => m.type === "translation")
      .reduce((acc, m) => acc + m.content.length, 0)

    return {
      totalSize: size,
      percentage: Math.min(100, (size / SESSION_MAX_CONTEXT_SIZE) * 100),
      showWarning: size >= SESSION_WARNING_THRESHOLD,
    }
  }, [session])

  return {
    totalSize,
    percentage,
    showWarning,
  }
}
