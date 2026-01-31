import { create } from "zustand"
import type { Model, ToneSettings } from "@/lib/constants"
import { DEFAULT_MODEL, DEFAULT_TONE } from "@/lib/constants"

interface TranslationState {
  currentSessionId: string | null
  model: Model
  tone: ToneSettings
  setCurrentSessionId: (sessionId: string | null) => void
  setModel: (model: Model) => void
  setTone: (tone: ToneSettings) => void
  updateTone: (partial: Partial<ToneSettings>) => void
}

export const useTranslationStore = create<TranslationState>((set) => ({
  currentSessionId: null,
  model: DEFAULT_MODEL,
  tone: DEFAULT_TONE,
  setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
  setModel: (model) => set({ model }),
  setTone: (tone) => set({ tone }),
  updateTone: (partial) => set((state) => ({ tone: { ...state.tone, ...partial } })),
}))
