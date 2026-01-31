import { useMemo } from "react"
import {
  useSessionsQuery,
  useDeleteSessionMutation,
  useClearAllSessionsMutation,
} from "@/queries/sessions"
import type { SessionListItem } from "@/types/session"

const ONE_DAY_MS = 24 * 60 * 60 * 1000

interface GroupedSessions {
  recent: SessionListItem[]
  older: SessionListItem[]
}

export function useSessions() {
  const query = useSessionsQuery()
  const deleteMutation = useDeleteSessionMutation()
  const clearAllMutation = useClearAllSessionsMutation()

  const grouped = useMemo<GroupedSessions>(() => {
    if (!query.data) return { recent: [], older: [] }

    const now = Date.now()
    const recent: SessionListItem[] = []
    const older: SessionListItem[] = []

    for (const session of query.data) {
      if (now - session.updatedAt < ONE_DAY_MS) {
        recent.push(session)
      } else {
        older.push(session)
      }
    }

    return { recent, older }
  }, [query.data])

  return {
    sessions: query.data ?? [],
    recentSessions: grouped.recent,
    olderSessions: grouped.older,
    isLoading: query.isLoading,
    error: query.error,
    deleteSession: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    clearAll: clearAllMutation.mutate,
    isClearing: clearAllMutation.isPending,
    refetch: query.refetch,
  }
}
