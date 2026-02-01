import { useDeleteSessionMutation, useClearAllSessionsMutation } from "@/queries/sessions"
import { useRealtimeSessions } from "./useRealtimeSessions"

export function useSessions() {
  const { sessions, error } = useRealtimeSessions()
  const deleteMutation = useDeleteSessionMutation()
  const clearAllMutation = useClearAllSessionsMutation()

  return {
    sessions,
    error,
    deleteSession: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    clearAll: clearAllMutation.mutate,
    isClearing: clearAllMutation.isPending,
  }
}
