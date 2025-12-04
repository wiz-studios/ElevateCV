import { type NextRequest, NextResponse } from "next/server"
import { verifyEmailToken } from "@/src/services/auth"
import { logAuditEvent } from "@/src/services/audit"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 })
    }

    const result = verifyEmailToken(token)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    logAuditEvent("auth.email_verified", {
      userId: result.userId,
      metadata: { method: "token" },
    })

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("[Auth] Email verification error:", error)
    return NextResponse.json({ success: false, error: "Failed to verify email" }, { status: 500 })
  }
}
