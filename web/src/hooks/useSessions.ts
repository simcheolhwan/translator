import { useMemo } from "react"
import { useDeleteSessionMutation, useClearAllSessionsMutation } from "@/queries/sessions"
import { useRealtimeSessions } from "./useRealtimeSessions"
import type { SessionListItem } from "@/types/session"

const ONE_DAY_MS = 24 * 60 * 60 * 1000

interface GroupedSessions {
  recent: SessionListItem[]
  older: SessionListItem[]
}

export function useSessions() {
  const { sessions, loading, error } = useRealtimeSessions()
  const deleteMutation = useDeleteSessionMutation()
  const clearAllMutation = useClearAllSessionsMutation()

  const grouped = useMemo<GroupedSessions>(() => {
    if (!sessions.length) return { recent: [], older: [] }

    const now = Date.now()
    const recent: SessionListItem[] = []
    const older: SessionListItem[] = []

    for (const session of sessions) {
      if (now - session.updatedAt < ONE_DAY_MS) {
        recent.push(session)
      } else {
        older.push(session)
      }
    }

    return { recent, older }
  }, [sessions])

  return {
    sessions,
    recentSessions: grouped.recent,
    olderSessions: grouped.older,
    isLoading: loading,
    error,
    deleteSession: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    clearAll: clearAllMutation.mutate,
    isClearing: clearAllMutation.isPending,
  }
}
