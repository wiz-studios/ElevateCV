import { type NextRequest, NextResponse } from "next/server"
import { generatePasswordResetToken, getUserByEmail } from "@/src/services/auth"
import { logAuditEvent } from "@/src/services/audit"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const token = generatePasswordResetToken(email)

    // Always return success to prevent email enumeration
    logAuditEvent("auth.password_reset_request", {
      userId: getUserByEmail(email)?.id || null,
      metadata: { email, tokenGenerated: !!token },
    })

    // In production, send email with reset link
    // await sendPasswordResetEmail(email, token)

    // For MVP, log the token (remove in production!)
    if (token && process.env.NODE_ENV === "development") {
      console.log(`[Auth] Password reset token for ${email}: ${token}`)
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link",
      // Only include token in development for testing
      ...(process.env.NODE_ENV === "development" && token ? { token } : {}),
    })
  } catch (error) {
    console.error("[Auth] Forgot password error:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}
