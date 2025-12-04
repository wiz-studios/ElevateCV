/**
 * POST /api/auth/login
 * Authenticate user with Supabase and return session
 */

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAuditEvent } from "@/src/services/audit"
import { getUserById } from "@/src/services/auth"
import { getBillingUsage } from "@/src/services/billing"
import type { LoginRequest, AuthResponse } from "@/src/types/auth"
import { toPublicUser } from "@/src/services/auth"

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: body.email.toLowerCase(),
      password: body.password,
    })

    if (authError || !authData.user || !authData.session) {
      logAuditEvent("auth.login", {
        metadata: { email: body.email },
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        success: false,
        errorMessage: authError?.message || "Login failed",
      })
      return NextResponse.json<AuthResponse>({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Get user profile
    const profile = await getUserById(authData.user.id)
    if (!profile) {
      return NextResponse.json<AuthResponse>({ success: false, error: "User profile not found" }, { status: 500 })
    }

    logAuditEvent("auth.login", {
      userId: authData.user.id,
      metadata: { email: authData.user.email, plan: profile.plan },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      success: true,
    })

    // Return user data (session is automatically set in cookies by Supabase)
    return NextResponse.json<AuthResponse>({
      success: true,
      user: toPublicUser(profile),
      tokens: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_in: authData.session.expires_in || 3600,
      },
      message: "Login successful",
    })
  } catch (error) {
    console.error("[API] Login error:", error)
    return NextResponse.json<AuthResponse>({ success: false, error: "Failed to login" }, { status: 500 })
  }
}
