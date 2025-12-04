/**
 * POST /api/auth/refresh
 * Refresh Supabase session
 */

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { AuthResponse } from "@/src/types/auth"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Refresh the session
    const { data, error } = await supabase.auth.refreshSession()

    if (error || !data.session) {
      return NextResponse.json<AuthResponse>({ success: false, error: "Failed to refresh session" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      tokens: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in || 3600,
      },
    })
  } catch (error) {
    console.error("[API] Refresh error:", error)
    return NextResponse.json<AuthResponse>({ success: false, error: "Failed to refresh session" }, { status: 500 })
  }
}
