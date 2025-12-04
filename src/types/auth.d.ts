/**
 * Authentication & User Management Types - Supabase Version
 * Types for Supabase Auth integration
 */

import type { PlanType, SubscriptionStatus } from "./billing"
import type { User as SupabaseAuthUser } from "@supabase/supabase-js"

// Public user info (safe to expose to frontend)
export interface UserPublic {
  id: string
  email: string
  name?: string
  plan: PlanType
  credits: number
  subscription_status?: SubscriptionStatus
  subscription_expiry?: string
  email_verified: boolean
  created_at: string
}

// Auth Request Types
export interface SignupRequest {
  email: string
  password: string
  name?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirmRequest {
  token: string
  new_password: string
}

// Auth Response Types
export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number // seconds
}

export interface AuthResponse {
  success: boolean
  user?: UserPublic
  tokens?: AuthTokens
  error?: string
  message?: string
}

export interface LogoutResponse {
  success: boolean
  message?: string
}

// Session info for frontend
export interface AuthSession {
  user: UserPublic
  isAuthenticated: boolean
  accessToken: string
}

// Middleware augmented request
export interface AuthenticatedUser {
  id: string
  email: string
  plan: PlanType
  credits: number
}

// Rate limiting
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number // timestamp
}

// Re-export Supabase user type for convenience
export type { SupabaseAuthUser }
