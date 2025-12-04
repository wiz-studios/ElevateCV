/**
 * Authentication Service - Supabase Version
 * Handles user registration, login, and session management using Supabase Auth
 */

import { createAdminClient } from "@/lib/supabase/admin"
import type { UserPublic, SignupRequest, LoginRequest, AuthTokens } from "@/src/types/auth"
import type { PlanType } from "@/src/types/billing"
import type { Profile } from "@/src/types/database"

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Convert Profile to public user info
 */
export function toPublicUser(profile: Profile): UserPublic {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name || undefined,
    plan: profile.plan,
    credits: profile.credits,
    subscription_status: profile.subscription_status || undefined,
    subscription_expiry: profile.subscription_expiry || undefined,
    email_verified: true, // Supabase handles email verification
    created_at: profile.created_at,
  }
}

/**
 * Get user profile by ID
 */
export async function getUserById(userId: string): Promise<Profile | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error || !data) return null
  return data
}

/**
 * Get user profile by email
 */
export async function getUserByEmail(email: string): Promise<Profile | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("email", email.toLowerCase()).single()

  if (error || !data) return null
  return data
}

/**
 * Get public user info by ID
 */
export async function getPublicUserById(userId: string): Promise<UserPublic | null> {
  const profile = await getUserById(userId)
  if (!profile) return null
  return toPublicUser(profile)
}

// ============================================
// AUTH OPERATIONS
// ============================================

/**
 * Sign up new user
 */
export async function signup(
  data: SignupRequest,
): Promise<{ success: true; user: UserPublic; tokens: AuthTokens } | { success: false; error: string }> {
  const supabase = createAdminClient()

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return { success: false, error: "Invalid email format" }
  }

  // Validate password strength
  if (data.password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" }
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email.toLowerCase(),
    password: data.password,
    options: {
      data: {
        name: data.name,
      },
    },
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: "Failed to create user" }
  }

  // Update profile with name if provided
  if (data.name) {
    await supabase.from("profiles").update({ name: data.name }).eq("id", authData.user.id)
  }

  // Get the created profile
  const profile = await getUserById(authData.user.id)
  if (!profile) {
    return { success: false, error: "Failed to create user profile" }
  }

  // Return user data and session tokens
  return {
    success: true,
    user: toPublicUser(profile),
    tokens: {
      access_token: authData.session?.access_token || "",
      refresh_token: authData.session?.refresh_token || "",
      expires_in: authData.session?.expires_in || 3600,
    },
  }
}

/**
 * Login user
 */
export async function login(
  data: LoginRequest,
): Promise<{ success: true; user: UserPublic; tokens: AuthTokens } | { success: false; error: string }> {
  const supabase = createAdminClient()

  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: data.email.toLowerCase(),
    password: data.password,
  })

  if (authError) {
    return { success: false, error: "Invalid email or password" }
  }

  if (!authData.user || !authData.session) {
    return { success: false, error: "Invalid email or password" }
  }

  // Get user profile
  const profile = await getUserById(authData.user.id)
  if (!profile) {
    return { success: false, error: "User profile not found" }
  }

  return {
    success: true,
    user: toPublicUser(profile),
    tokens: {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_in: authData.session.expires_in || 3600,
    },
  }
}

/**
 * Logout user (invalidate session)
 */
export async function logout(userId: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.signOut(userId)

  return !error
}

/**
 * Refresh access token
 */
export async function refreshTokens(
  refreshToken: string,
): Promise<{ success: true; tokens: AuthTokens } | { success: false; error: string }> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })

  if (error || !data.session) {
    return { success: false, error: "Invalid refresh token" }
  }

  return {
    success: true,
    tokens: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in || 3600,
    },
  }
}

// ============================================
// PLAN MANAGEMENT
// ============================================

/**
 * Update user plan (called from billing service)
 */
export async function updateUserPlan(
  userId: string,
  plan: PlanType,
  subscriptionExpiry?: string,
): Promise<Profile | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("profiles")
    .update({
      plan,
      subscription_status: plan !== "free" ? "active" : null,
      subscription_expiry: subscriptionExpiry || null,
    })
    .eq("id", userId)
    .select()
    .single()

  if (error || !data) return null
  return data
}

/**
 * Add credits to user
 */
export async function addUserCredits(userId: string, credits: number): Promise<Profile | null> {
  const supabase = createAdminClient()

  // Get current credits
  const profile = await getUserById(userId)
  if (!profile) return null

  const newCredits = profile.credits + credits

  const { data, error } = await supabase
    .from("profiles")
    .update({ credits: newCredits })
    .eq("id", userId)
    .select()
    .single()

  if (error || !data) return null
  return data
}

/**
 * Deduct credits from user
 */
export async function deductUserCredits(userId: string, credits: number): Promise<boolean> {
  const supabase = createAdminClient()

  // Get current credits
  const profile = await getUserById(userId)
  if (!profile || profile.credits < credits) return false

  const newCredits = profile.credits - credits

  const { error } = await supabase.from("profiles").update({ credits: newCredits }).eq("id", userId)

  return !error
}

// ============================================
// SYNC WITH BILLING SERVICE
// ============================================

/**
 * Sync user with billing service
 * Call this when user data changes in billing
 */
export async function syncUserFromBilling(
  userId: string,
  updates: { plan?: PlanType; credits?: number; subscription_expiry?: string },
): Promise<Profile | null> {
  const supabase = createAdminClient()

  const updateData: Partial<Profile> = {}
  if (updates.plan !== undefined) updateData.plan = updates.plan
  if (updates.credits !== undefined) updateData.credits = updates.credits
  if (updates.subscription_expiry !== undefined) updateData.subscription_expiry = updates.subscription_expiry

  const { data, error } = await supabase.from("profiles").update(updateData).eq("id", userId).select().single()

  if (error || !data) return null
  return data
}

// ============================================
// RATE LIMITING (In-Memory - Can be migrated to Redis later)
// ============================================

const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map()

const RATE_LIMITS: Record<PlanType, { requests: number; windowMs: number }> = {
  free: { requests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
  premium: { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  enterprise: { requests: 1000, windowMs: 60 * 1000 }, // 1000 requests per minute
}

export function checkRateLimit(
  userId: string,
  plan: PlanType,
): { allowed: boolean; remaining: number; resetTime: number } {
  const limit = RATE_LIMITS[plan]
  const key = `${userId}:${Math.floor(Date.now() / limit.windowMs)}`

  let entry = rateLimitStore.get(key)
  if (!entry) {
    entry = { count: 0, resetTime: Date.now() + limit.windowMs }
    rateLimitStore.set(key, entry)
  }

  entry.count++

  return {
    allowed: entry.count <= limit.requests,
    remaining: Math.max(0, limit.requests - entry.count),
    resetTime: entry.resetTime,
  }
}
