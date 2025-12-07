"use client"

/**
 * Authentication Context - Supabase Version
 * Provides auth state and methods to all components using Supabase
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { UserPublic } from "@/src/types/auth"
import type { BillingUsage } from "@/src/types/billing"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  user: UserPublic | null
  billing: BillingUsage | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    billing: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const supabase = createClient()
  const router = useRouter()

  // Fetch current user and billing data
  const refreshUser = useCallback(async () => {
    try {
      // Get Supabase session
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setState({
          user: null,
          billing: null,
          isLoading: false,
          isAuthenticated: false,
        })
        return
      }

      // Fetch user profile and billing from API
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setState({
            user: data.user,
            billing: data.billing,
            isLoading: false,
            isAuthenticated: true,
          })
          return
        }
      }

      // If API call fails but we have a session, set basic user data
      setState({
        user: {
          id: user.id,
          email: user.email || "",
          plan: "free",
          credits: 0,
          email_verified: true,
          created_at: user.created_at,
        },
        billing: null,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error("[Auth] Error refreshing user:", error)
      setState({
        user: null,
        billing: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [supabase])

  // Define logout BEFORE auto-logout useEffect (which depends on it)
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setState({
        user: null,
        billing: null,
        isLoading: false,
        isAuthenticated: false,
      })
      router.push("/login")
    } catch (error) {
      console.error("[Auth] Logout error:", error)
    }
  }, [supabase, router])

  // Auto-logout after 15 minutes of inactivity
  useEffect(() => {
    if (!state.isAuthenticated) return

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes in milliseconds
    let inactivityTimer: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => {
        console.log("[Auth] Auto-logout due to inactivity")
        logout()
      }, INACTIVITY_TIMEOUT)
    }

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    // Start the timer
    resetTimer()

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer)
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [state.isAuthenticated, logout])

  // Listen to auth state changes
  useEffect(() => {
    // Initial session check
    refreshUser()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth] State changed:", event)

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await refreshUser()
      } else if (event === "SIGNED_OUT") {
        setState({
          user: null,
          billing: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, refreshUser])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        })

        if (error) {
          return { success: false, error: error.message }
        }

        if (data.user) {
          // Refresh user data
          await refreshUser()
          return { success: true }
        }

        return { success: false, error: "Login failed" }
      } catch (error) {
        console.error("[Auth] Login error:", error)
        return { success: false, error: "Network error" }
      }
    },
    [supabase, refreshUser],
  )

  const signup = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: {
            data: {
              name,
            },
          },
        })

        if (error) {
          return { success: false, error: error.message }
        }

        if (data.user) {
          // Update profile with name if provided
          if (name) {
            await fetch("/api/auth/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password, name }),
            })
          }

          // Refresh user data
          await refreshUser()
          return { success: true }
        }

        return { success: false, error: "Signup failed" }
      } catch (error) {
        console.error("[Auth] Signup error:", error)
        return { success: false, error: "Network error" }
      }
    },
    [supabase, refreshUser],
  )

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
