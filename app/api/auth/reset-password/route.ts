import { type NextRequest, NextResponse } from "next/server"
import { resetPasswordWithToken } from "@/src/services/auth"
import { logAuditEvent } from "@/src/services/audit"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ success: false, error: "Token and password are required" }, { status: 400 })
    }

    const result = await resetPasswordWithToken(token, password)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    logAuditEvent("auth.password_reset_complete", {
      metadata: { method: "token" },
    })

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("[Auth] Reset password error:", error)
    return NextResponse.json({ success: false, error: "Failed to reset password" }, { status: 500 })
  }
}
