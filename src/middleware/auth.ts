/**
 * Authentication Middleware - Supabase Version
 * Session verification and quota checking for protected routes
 */

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserById, checkRateLimit } from "@/src/services/auth"
import { checkQuota } from "@/src/services/billing"
import type { AuthenticatedUser } from "@/src/types/auth"

// ============================================
// AUTH MIDDLEWARE
// ============================================

/**
 * Verify authentication and return user
 * Returns null if not authenticated
 */
export async function verifyAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  const supabase = await createClient()

  // Get the current user from Supabase session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  // Get user profile for plan and credits
  const profile = await getUserById(user.id)
  if (!profile) return null

  return {
    id: user.id,
    email: user.email || "",
    plan: profile.plan,
    credits: profile.credits,
  }
}

/**
 * Auth middleware - returns error response if not authenticated
 */
export async function authMiddleware(
  request: NextRequest,
): Promise<{ user: AuthenticatedUser } | { error: NextResponse }> {
  const user = await verifyAuth(request)

  if (!user) {
    return {
      error: NextResponse.json({ success: false, error: "Unauthorized. Please log in." }, { status: 401 }),
    }
  }

  return { user }
}

/**
 * Check rate limit for user
 */
export function rateLimitMiddleware(user: AuthenticatedUser): { allowed: true } | { error: NextResponse } {
  const rateLimit = checkRateLimit(user.id, user.plan)

  if (!rateLimit.allowed) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          retry_after: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.resetTime),
            "Retry-After": String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          },
        },
      ),
    }
  }

  return { allowed: true }
}

/**
 * Check quota for AI tailoring
 */
export async function quotaMiddleware(userId: string): Promise<{ allowed: true; remaining: number } | { error: NextResponse }> {
  const quotaCheck = await checkQuota(userId)

  if (!quotaCheck.allowed) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: quotaCheck.reason || "Quota exceeded",
          upgrade_required: quotaCheck.upgrade_required,
        },
        { status: 402 }, // Payment Required
      ),
    }
  }

  return { allowed: true, remaining: quotaCheck.credits_remaining || 0 }
}

/**
 * Combined middleware: auth + rate limit + quota
 */
export async function protectedTailorMiddleware(
  request: NextRequest,
): Promise<{ user: AuthenticatedUser; remaining: number } | { error: NextResponse }> {
  // 1. Check authentication
  const authResult = await authMiddleware(request)
  if ("error" in authResult) return authResult

  const { user } = authResult

  // 2. Check rate limit
  const rateLimitResult = rateLimitMiddleware(user)
  if ("error" in rateLimitResult) return rateLimitResult

  // 3. Check quota
  const quotaResult = await quotaMiddleware(user.id)
  if ("error" in quotaResult) return quotaResult

  return { user, remaining: quotaResult.remaining }
}

/**
 * Optional auth - returns user if authenticated, null otherwise
 * Does not block the request
 */
export async function optionalAuthMiddleware(request: NextRequest): Promise<AuthenticatedUser | null> {
  return verifyAuth(request)
}
