import { useCallback, useMemo, useSyncExternalStore } from "react"
import { ref, onValue } from "firebase/database"
import { database } from "@/lib/firebase"
import { useAuth } from "./useAuth"
import type { Message } from "shared/types"
import type { Session } from "@/types/session"

interface SessionData {
  username?: string
  description?: string
  createdAt: number
  updatedAt: number
  messages?: Record<string, Omit<Message, "id">>
}

interface SessionState {
  session: Session | null
  loading: boolean
  error: Error | null
}

function createSessionStore(userId: string | undefined, sessionId: string | undefined) {
  let state: SessionState = { session: null, loading: true, error: null }
  const listeners = new Set<() => void>()

  const notify = () => listeners.forEach((listener) => listener())

  const subscribe = (listener: () => void) => {
    listeners.add(listener)

    if (!sessionId || !userId) {
      state = { session: null, loading: false, error: null }
      notify()
      return () => listeners.delete(listener)
    }

    const sessionRef = ref(database, `users/${userId}/sessions/${sessionId}`)

    const unsubscribe = onValue(
      sessionRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          state = { session: null, loading: false, error: null }
          notify()
          return
        }

        const data = snapshot.val() as SessionData
        const messages: Message[] = data.messages
          ? Object.entries(data.messages).map(([id, msg]) => ({
              id,
              ...msg,
            }))
          : []

        state = {
          session: {
            id: sessionId,
            username: data.username,
            description: data.description || "",
            messages,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          },
          loading: false,
          error: null,
        }
        notify()
      },
      (err) => {
        state = { session: null, loading: false, error: err }
        notify()
      },
    )

    return () => {
      listeners.delete(listener)
      unsubscribe()
    }
  }

  const getSnapshot = () => state

  return { subscribe, getSnapshot }
}

export function useRealtimeSession(sessionId: string | undefined) {
  const { user } = useAuth()

  const store = useMemo(() => createSessionStore(user?.uid, sessionId), [user?.uid, sessionId])

  const subscribe = useCallback((listener: () => void) => store.subscribe(listener), [store])

  const getSnapshot = useCallback(() => store.getSnapshot(), [store])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
