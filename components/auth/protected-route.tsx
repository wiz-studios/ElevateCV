"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPlan?: "free" | "premium" | "enterprise"
}

export function ProtectedRoute({ children, requiredPlan }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (!isLoading && isAuthenticated && requiredPlan && user) {
      const planHierarchy = { free: 0, premium: 1, enterprise: 2 }
      const userPlanLevel = planHierarchy[user.plan]
      const requiredPlanLevel = planHierarchy[requiredPlan]

      if (userPlanLevel < requiredPlanLevel) {
        router.push("/pricing?upgrade=" + requiredPlan)
      }
    }
  }, [isLoading, isAuthenticated, user, requiredPlan, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (requiredPlan && user) {
    const planHierarchy = { free: 0, premium: 1, enterprise: 2 }
    const userPlanLevel = planHierarchy[user.plan]
    const requiredPlanLevel = planHierarchy[requiredPlan]

    if (userPlanLevel < requiredPlanLevel) {
      return null // Will redirect
    }
  }

  return <>{children}</>
}
