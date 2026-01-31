import { useState, useCallback } from "react"
import { useTranslateMutation } from "@/queries/translations"
import { DEFAULT_MODEL, DEFAULT_TONE, type Model, type ToneSettings } from "@/lib/constants"

interface UseTranslateOptions {
  sessionId?: string
  onSuccess?: (sessionId: string) => void
}

export function useTranslate(options: UseTranslateOptions = {}) {
  const { sessionId, onSuccess } = options
  const mutation = useTranslateMutation()

  const [model, setModel] = useState<Model>(DEFAULT_MODEL)
  const [tone, setTone] = useState<ToneSettings>(DEFAULT_TONE)

  const translate = useCallback(
    async (text: string, overrides?: { concise?: boolean; parentMessageId?: string }) => {
      const result = await mutation.mutateAsync({
        sessionId,
        text,
        model,
        tone,
        ...overrides,
      })

      onSuccess?.(result.sessionId)
      return result
    },
    [mutation, sessionId, model, tone, onSuccess],
  )

  const retranslate = useCallback(
    async (text: string, parentMessageId: string) => {
      return translate(text, { concise: true, parentMessageId })
    },
    [translate],
  )

  return {
    translate,
    retranslate,
    model,
    setModel,
    tone,
    setTone,
    isTranslating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}
