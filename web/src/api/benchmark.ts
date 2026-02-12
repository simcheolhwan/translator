import { api } from "./client"
import type { BenchmarkRequest, BenchmarkResponse } from "functions/types"

export async function benchmark(request: BenchmarkRequest): Promise<BenchmarkResponse> {
  const response = await api
    .post("benchmark", { json: request, timeout: 120 * 1000 })
    .json<BenchmarkResponse>()
  return response
}
