import { api } from "./client"
import type { TranslateRequest, TranslateResponse } from "functions/types"

export async function translate(request: TranslateRequest): Promise<TranslateResponse> {
  const response = await api.post("translate", { json: request }).json<TranslateResponse>()
  return response
}
