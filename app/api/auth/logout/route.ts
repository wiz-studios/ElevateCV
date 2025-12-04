/**
 * POST /api/auth/logout
 * Sign out user from Supabase
 */

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAuditEvent } from "@/src/services/audit"
import type { LogoutResponse } from "@/src/types/auth"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user before logging out
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("[API] Logout error:", error)
      return NextResponse.json<LogoutResponse>({ success: false, message: "Failed to logout" }, { status: 500 })
    }

    if (user) {
      logAuditEvent("auth.logout", {
        userId: user.id,
        metadata: { email: user.email },
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        success: true,
      })
    }

    return NextResponse.json<LogoutResponse>({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("[API] Logout error:", error)
    return NextResponse.json<LogoutResponse>({ success: false, message: "Failed to logout" }, { status: 500 })
  }
}
