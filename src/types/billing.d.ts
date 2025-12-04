/**
 * Billing & Subscription Types
 * Pricing integration for AI Resume Builder
 */

// User Plan Types
export type PlanType = "free" | "premium" | "enterprise"

// Subscription Status
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "past_due"

// User Account with Billing Info
export interface User {
  id: string
  email: string
  name?: string
  plan: PlanType
  credits: number
  subscription_status?: SubscriptionStatus
  subscription_expiry?: string // ISO date string
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

// Usage Log Entry
export interface UsageLog {
  id: string
  user_id: string
  date: string // ISO date string
  action: "tailor" | "ats_score" | "pdf_export"
  credits_used: number
  created_at: string
}

// Plan Configuration
export interface PlanConfig {
  type: PlanType
  name: string
  monthly_price: number
  yearly_price: number
  monthly_tailors: number // -1 for unlimited
  features: string[]
  credits_included: number
}

// Credit Package
export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  popular?: boolean
}

// Billing Usage Response
export interface BillingUsage {
  user_id: string
  plan: PlanType
  plan_name: string
  credits_remaining: number
  monthly_quota: number
  monthly_used: number
  quota_reset_date: string
  subscription_status?: SubscriptionStatus
  subscription_expiry?: string
  features: string[]
}

// Purchase Request
export interface PurchaseRequest {
  user_id: string
  type: "subscription" | "credits"
  plan?: PlanType
  billing_period?: "monthly" | "yearly"
  credit_package_id?: string
}

// Purchase Response
export interface PurchaseResponse {
  success: boolean
  checkout_url?: string
  error?: string
}

// Quota Check Result
export interface QuotaCheckResult {
  allowed: boolean
  reason?: string
  credits_remaining?: number
  upgrade_required?: boolean
}

// API Response Types
export interface BillingUsageResponse {
  success: boolean
  data?: BillingUsage
  error?: string
}

export interface QuotaCheckResponse {
  success: boolean
  data?: QuotaCheckResult
  error?: string
}
