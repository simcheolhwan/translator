import { useMutation } from "@tanstack/react-query"
import * as translateApi from "@/api/translate"
import type { TranslateRequest } from "functions/types"

export function useTranslateMutation() {
  return useMutation({
    mutationFn: (request: TranslateRequest) => translateApi.translate(request),
  })
}
