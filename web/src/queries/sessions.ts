import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./keys"
import * as sessionsApi from "@/api/sessions"

export function useSessionsQuery() {
  return useQuery({
    ...queryKeys.sessions.all,
    queryFn: sessionsApi.listSessions,
  })
}

export function useSessionQuery(sessionId: string) {
  return useQuery({
    ...queryKeys.sessions.detail(sessionId),
    queryFn: () => sessionsApi.getSession(sessionId),
    enabled: !!sessionId,
  })
}

export function useDeleteSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionsApi.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.sessions.all)
    },
  })
}

export function useClearAllSessionsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionsApi.clearAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.sessions.all)
    },
  })
}
