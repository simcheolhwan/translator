import { useMutation } from "@tanstack/react-query"
import * as sessionsApi from "@/api/sessions"

export function useDeleteSessionMutation() {
  return useMutation({
    mutationFn: sessionsApi.deleteSession,
  })
}

export function useClearAllSessionsMutation() {
  return useMutation({
    mutationFn: sessionsApi.clearAllSessions,
  })
}
