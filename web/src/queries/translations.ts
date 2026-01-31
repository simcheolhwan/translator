import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./keys"
import * as translateApi from "@/api/translate"
import type { TranslateRequest } from "@/types/translation"

export function useTranslateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: TranslateRequest) => translateApi.translate(request),
    onSuccess: (data) => {
      // Invalidate session list to update timestamps
      queryClient.invalidateQueries(queryKeys.sessions.all)
      // Invalidate specific session to get new messages
      queryClient.invalidateQueries(queryKeys.sessions.detail(data.sessionId))
    },
  })
}
