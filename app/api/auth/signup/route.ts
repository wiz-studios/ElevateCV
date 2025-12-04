/**
 * POST /api/auth/signup
 * Create new user with Supabase Auth
 */

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAuditEvent } from "@/src/services/audit"
import { getUserById, toPublicUser } from "@/src/services/auth"
import type { SignupRequest, AuthResponse } from "@/src/types/auth"

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json<AuthResponse>({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (body.password.length < 8) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // Sign up with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email.toLowerCase(),
      password: body.password,
      options: {
        data: {
          name: body.name,
        },
      },
    })

    if (authError) {
      logAuditEvent("auth.signup", {
        metadata: { email: body.email },
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        success: false,
        errorMessage: authError.message,
      })
      return NextResponse.json<AuthResponse>({ success: false, error: authError.message }, { status: 400 })
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json<AuthResponse>({ success: false, error: "Failed to create user" }, { status: 500 })
    }

    // Update profile with name if provided
    if (body.name) {
      await supabase.from("profiles").update({ name: body.name }).eq("id", authData.user.id)
    }

    // Get user profile (should be created by trigger)
    const profile = await getUserById(authData.user.id)
    if (!profile) {
      return NextResponse.json<AuthResponse>({ success: false, error: "Failed to create user profile" }, { status: 500 })
    }

    logAuditEvent("auth.signup", {
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
      message: "Signup successful",
    })
  } catch (error) {
    console.error("[API] Signup error:", error)
    return NextResponse.json<AuthResponse>({ success: false, error: "Failed to create account" }, { status: 500 })
  }
}
