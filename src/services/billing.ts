/**
 * Billing Service - Supabase Version
 * Handles plan management, quota tracking, credit deduction using Supabase database
 */

import type {
  User,
  UsageLog,
  PlanType,
  PlanConfig,
  CreditPackage,
  BillingUsage,
  QuotaCheckResult,
} from "@/src/types/billing"
import { syncUserFromBilling } from "./auth"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Profile, UsageLog as DBUsageLog } from "@/src/types/database"

// ============================================
// PLAN CONFIGURATIONS
// ============================================

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    type: "free",
    name: "Free",
    monthly_price: 0,
    yearly_price: 0,
    monthly_tailors: 3,
    credits_included: 0,
    features: ["3 AI-tailored resumes per month", "Basic ATS scoring", "PDF export", "Standard templates"],
  },
  premium: {
    type: "premium",
    name: "Premium",
    monthly_price: 9.99,
    yearly_price: 79.99,
    monthly_tailors: -1, // Unlimited
    credits_included: 0,
    features: [
      "Unlimited AI-tailored resumes",
      "Advanced ATS scoring & insights",
      "Priority PDF export",
      "Premium templates",
      "Cover letter generator",
      "LinkedIn optimization",
      "Email support",
    ],
  },
  enterprise: {
    type: "enterprise",
    name: "Enterprise",
    monthly_price: 49.99,
    yearly_price: 399.99,
    monthly_tailors: -1, // Unlimited
    credits_included: 100,
    features: [
      "Everything in Premium",
      "Multi-user support",
      "Team analytics",
      "Custom branding",
      "API access",
      "Dedicated support",
      "SSO integration",
    ],
  },
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "credits_5", name: "5 Credits", credits: 5, price: 4.99 },
  { id: "credits_15", name: "15 Credits", credits: 15, price: 9.99, popular: true },
  { id: "credits_50", name: "50 Credits", credits: 50, price: 24.99 },
]

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Convert Profile to User type
 */
function profileToUser(profile: Profile): User {
  // ADMIN OVERRIDE: Grant full access to specific user
  if (profile.email === "kipkuruironoh254@gmail.com") {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name || undefined,
      plan: "enterprise",
      credits: 9999,
      subscription_status: "active",
      subscription_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      stripe_customer_id: profile.stripe_customer_id || undefined,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name || undefined,
    plan: profile.plan,
    credits: profile.credits,
    subscription_status: profile.subscription_status || undefined,
    subscription_expiry: profile.subscription_expiry || undefined,
    stripe_customer_id: profile.stripe_customer_id || undefined,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  }
}

/**
 * Get or create user by ID
 */
export async function getOrCreateUser(userId: string, email?: string): Promise<User> {
  const supabase = createAdminClient()

  // Try to get existing user
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (profile) {
    return profileToUser(profile)
  }

  // For demo users, return a default user object without creating in DB
  if (userId.startsWith("demo_")) {
    const now = new Date().toISOString()
    return {
      id: userId,
      email: email || `${userId}@demo.local`,
      plan: "free",
      credits: 0,
      subscription_status: undefined,
      subscription_expiry: undefined,
      created_at: now,
      updated_at: now,
    }
  }

  // Create new user if doesn't exist (shouldn't happen with trigger, but fallback)
  if (!email) {
    throw new Error("Email required to create user")
  }

  const { data: newProfile, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email: email.toLowerCase(),
      plan: "free",
      credits: 0,
    })
    .select()
    .single()

  if (error || !newProfile) {
    throw new Error("Failed to create user profile")
  }

  return profileToUser(newProfile)
}

/**
 * Update user plan
 */
export async function updateUserPlan(userId: string, plan: PlanType, subscriptionExpiry?: string): Promise<User> {
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

  if (error || !data) {
    throw new Error("Failed to update user plan")
  }

  await syncUserFromBilling(userId, { plan, subscription_expiry: subscriptionExpiry })

  return profileToUser(data)
}

/**
 * Add credits to user account
 */
export async function addCredits(userId: string, credits: number): Promise<User> {
  const supabase = createAdminClient()

  // Get current credits
  const { data: profile } = await supabase.from("profiles").select("credits").eq("id", userId).single()

  if (!profile) {
    throw new Error("User not found")
  }

  const newCredits = profile.credits + credits

  const { data, error } = await supabase.from("profiles").update({ credits: newCredits }).eq("id", userId).select().single()

  if (error || !data) {
    throw new Error("Failed to add credits")
  }

  await syncUserFromBilling(userId, { credits: newCredits })

  return profileToUser(data)
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(userId: string, credits: number): Promise<boolean> {
  const supabase = createAdminClient()

  // Get current credits
  const { data: profile } = await supabase.from("profiles").select("credits").eq("id", userId).single()

  if (!profile || profile.credits < credits) {
    return false
  }

  const newCredits = profile.credits - credits

  const { error } = await supabase.from("profiles").update({ credits: newCredits }).eq("id", userId)

  if (error) {
    return false
  }

  // Sync credit change back to auth service
  await syncUserFromBilling(userId, { credits: newCredits })

  return true
}

// ============================================
// USAGE TRACKING
// ============================================

/**
 * Get usage for current month
 */
export async function getMonthlyUsage(userId: string): Promise<number> {
  const supabase = createAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data, error } = await supabase
    .from("usage_logs")
    .select("credits_used")
    .eq("user_id", userId)
    .gte("created_at", startOfMonth)

  if (error || !data) return 0

  return data.reduce((sum, log) => sum + log.credits_used, 0)
}

/**
 * Log usage action
 */
export async function logUsage(userId: string, action: UsageLog["action"], creditsUsed = 1): Promise<UsageLog> {
  const supabase = createAdminClient()

  const logData: DBUsageLog = {
    id: crypto.randomUUID(),
    user_id: userId,
    date: new Date().toISOString().split("T")[0],
    action,
    credits_used: creditsUsed,
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("usage_logs").insert(logData).select().single()

  if (error || !data) {
    throw new Error("Failed to log usage")
  }

  return {
    id: data.id,
    user_id: data.user_id,
    date: data.date,
    action: data.action,
    credits_used: data.credits_used,
    created_at: data.created_at,
  }
}

// ============================================
// QUOTA CHECKING
// ============================================

/**
 * Check if user has quota/credits for an action
 */
export async function checkQuota(userId: string): Promise<QuotaCheckResult> {
  const user = await getOrCreateUser(userId)
  const planConfig = PLANS[user.plan]
  const monthlyUsed = await getMonthlyUsage(userId)

  // Check subscription expiry for paid plans
  if (user.plan !== "free" && user.subscription_expiry) {
    const expiry = new Date(user.subscription_expiry)
    if (expiry < new Date()) {
      // Subscription expired, check if they have credits
      if (user.credits > 0) {
        return {
          allowed: true,
          credits_remaining: user.credits,
        }
      }
      return {
        allowed: false,
        reason: "Subscription expired. Please renew or purchase credits.",
        upgrade_required: true,
      }
    }
  }

  // Unlimited plans
  if (planConfig.monthly_tailors === -1) {
    return {
      allowed: true,
      credits_remaining: -1, // Unlimited
    }
  }

  // Check monthly quota for free plan
  const quotaRemaining = planConfig.monthly_tailors - monthlyUsed

  if (quotaRemaining > 0) {
    return {
      allowed: true,
      credits_remaining: quotaRemaining,
    }
  }

  // Quota exceeded, check for purchased credits
  if (user.credits > 0) {
    return {
      allowed: true,
      credits_remaining: user.credits,
    }
  }

  return {
    allowed: false,
    reason: `Monthly quota of ${planConfig.monthly_tailors} tailored resumes exceeded. Upgrade to Premium for unlimited access.`,
    upgrade_required: true,
    credits_remaining: 0,
  }
}

/**
 * Consume quota/credits for an action
 * Returns true if successful, false if quota exceeded
 */
export async function consumeQuota(userId: string): Promise<boolean> {
  const user = await getOrCreateUser(userId)
  const check = await checkQuota(userId)

  if (!check.allowed) {
    return false
  }

  const planConfig = PLANS[user.plan]

  // For paid unlimited plans, just log usage
  if (planConfig.monthly_tailors === -1) {
    await logUsage(userId, "tailor", 0) // No credit cost
    return true
  }

  const monthlyUsed = await getMonthlyUsage(userId)
  const quotaRemaining = planConfig.monthly_tailors - monthlyUsed

  // Use quota first, then credits
  if (quotaRemaining > 0) {
    await logUsage(userId, "tailor", 1)
    return true
  }

  // Use purchased credits
  if (await deductCredits(userId, 1)) {
    await logUsage(userId, "tailor", 1)
    return true
  }

  return false
}

// ============================================
// BILLING INFO
// ============================================

/**
 * Get complete billing usage info for a user
 */
export async function getBillingUsage(userId: string): Promise<BillingUsage> {
  const user = await getOrCreateUser(userId)
  const planConfig = PLANS[user.plan]
  const monthlyUsed = await getMonthlyUsage(userId)

  // Calculate quota reset date (first of next month)
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return {
    user_id: userId,
    plan: user.plan,
    plan_name: planConfig.name,
    credits_remaining: user.credits,
    monthly_quota: planConfig.monthly_tailors,
    monthly_used: monthlyUsed,
    quota_reset_date: nextMonth.toISOString(),
    subscription_status: user.subscription_status,
    subscription_expiry: user.subscription_expiry,
    features: planConfig.features,
  }
}

// ============================================
// STRIPE INTEGRATION STUBS
// ============================================

/**
 * Stub: Create checkout URL
 * Replace with Stripe integration
 */
export function createCheckoutUrl(userId: string, type: "subscription" | "credits", planOrPackage: string): string {
  // In production, this would create a Stripe checkout session
  // and return the session URL

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}/checkout?user=${userId}&type=${type}&item=${planOrPackage}`
}
