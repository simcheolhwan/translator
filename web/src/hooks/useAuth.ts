import { useState, useEffect, useCallback } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { signInWithGoogle, signOut } from "@/lib/auth"

interface AuthState {
  user: User | null
  loading: boolean
  error: Error | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setState({ user, loading: false, error: null })
      },
      (error) => {
        setState({ user: null, loading: false, error })
      },
    )

    return unsubscribe
  }, [])

  const login = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }))
      await signInWithGoogle()
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Login failed"),
      }))
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Logout failed"),
      }))
    }
  }, [])

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    login,
    logout,
  }
}
