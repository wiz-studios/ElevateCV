/**
 * GET /api/auth/me
 * Get current user session and billing info
 */

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserById, toPublicUser } from "@/src/services/auth"
import { getBillingUsage } from "@/src/services/billing"
import type { AuthResponse } from "@/src/types/auth"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user from Supabase session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json<AuthResponse>({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Get user profile
    const profile = await getUserById(user.id)
    if (!profile) {
      return NextResponse.json<AuthResponse>({ success: false, error: "User profile not found" }, { status: 404 })
    }

    // Get billing usage
    const billing = await getBillingUsage(user.id)

    return NextResponse.json({
      success: true,
      user: toPublicUser(profile),
      billing,
    })
  } catch (error) {
    console.error("[API] Get user error:", error)
    return NextResponse.json<AuthResponse>({ success: false, error: "Failed to get user" }, { status: 500 })
  }
}
