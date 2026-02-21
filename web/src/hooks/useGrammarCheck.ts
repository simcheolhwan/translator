import { useState, useCallback } from "react"
import { useGrammarCheckMutation } from "@/queries/grammar"
import { DEFAULT_MODEL, type Model } from "functions/constants"
import type { GrammarCheckResponse } from "functions/types"

export function useGrammarCheck() {
  const mutation = useGrammarCheckMutation()

  const [model, setModel] = useState<Model>(DEFAULT_MODEL)
  const [result, setResult] = useState<GrammarCheckResponse | null>(null)
  const [sourceText, setSourceText] = useState<string | null>(null)

  const check = useCallback(
    async (text: string) => {
      setSourceText(text)
      setResult(null)
      mutation.reset()

      const response = await mutation.mutateAsync({ text, model })
      setResult(response)
      return response
    },
    [mutation, model],
  )

  const reset = useCallback(() => {
    setResult(null)
    setSourceText(null)
    mutation.reset()
  }, [mutation])

  return {
    check,
    model,
    setModel,
    isChecking: mutation.isPending,
    error: mutation.error,
    result,
    sourceText,
    reset,
  }
}
