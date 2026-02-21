import { api } from "./client"
import type { GrammarCheckRequest, GrammarCheckResponse } from "functions/types"

export async function grammarCheck(request: GrammarCheckRequest): Promise<GrammarCheckResponse> {
  const response = await api
    .post("grammarCheck", { json: request, timeout: 120_000 })
    .json<GrammarCheckResponse>()
  return response
}
