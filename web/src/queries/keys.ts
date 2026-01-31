import { createQueryKeyStore } from "@lukemorales/query-key-factory"

export const queryKeys = createQueryKeyStore({
  sessions: {
    all: null,
    detail: (sessionId: string) => [sessionId],
  },
  settings: {
    user: null,
  },
})
