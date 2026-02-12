import type { Model, ToneSettings } from "../constants.js"

export interface BenchmarkRequest {
  text: string
  isKorean: boolean
  models: Model[]
  tone: ToneSettings
}

export interface BenchmarkResult {
  model: Model
  translation: string
  durationMs: number
  error?: string
}

export interface BenchmarkResponse {
  results: BenchmarkResult[]
}
