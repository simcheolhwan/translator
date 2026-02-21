import { useMutation } from "@tanstack/react-query"
import * as grammarApi from "@/api/grammar"
import type { GrammarCheckRequest } from "functions/types"

export function useGrammarCheckMutation() {
  return useMutation({
    mutationFn: (request: GrammarCheckRequest) => grammarApi.grammarCheck(request),
  })
}
