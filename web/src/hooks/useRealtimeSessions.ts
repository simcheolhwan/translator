import { useCallback, useMemo, useSyncExternalStore } from "react"
import { ref, onValue } from "firebase/database"
import { database } from "@/lib/firebase"
import { useAuth } from "./useAuth"
import type { SessionListItem } from "@/types/session"

interface SessionData {
  username?: string
  description?: string
  createdAt: number
  updatedAt: number
}

interface SessionsState {
  sessions: SessionListItem[]
  loading: boolean
  error: Error | null
}

function createSessionsStore(userId: string | undefined) {
  let state: SessionsState = { sessions: [], loading: true, error: null }
  const listeners = new Set<() => void>()

  const notify = () => listeners.forEach((listener) => listener())

  const subscribe = (listener: () => void) => {
    listeners.add(listener)

    if (!userId) {
      state = { sessions: [], loading: false, error: null }
      notify()
      return () => listeners.delete(listener)
    }

    const sessionsRef = ref(database, `users/${userId}/sessions`)

    const unsubscribe = onValue(
      sessionsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          state = { sessions: [], loading: false, error: null }
          notify()
          return
        }

        const data = snapshot.val() as Record<string, SessionData>
        const sessions: SessionListItem[] = Object.entries(data)
          .map(([id, session]) => ({
            id,
            username: session.username,
            description: session.description || "",
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
          }))
          .sort((a, b) => b.updatedAt - a.updatedAt)

        state = { sessions, loading: false, error: null }
        notify()
      },
      (err) => {
        state = { sessions: [], loading: false, error: err }
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

export function useRealtimeSessions() {
  const { user } = useAuth()

  const store = useMemo(() => createSessionsStore(user?.uid), [user?.uid])

  const subscribe = useCallback((listener: () => void) => store.subscribe(listener), [store])

  const getSnapshot = useCallback(() => store.getSnapshot(), [store])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
