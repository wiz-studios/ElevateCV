/**
 * GET /api/billing/check-quota
 * Check if user has quota for tailoring
 */

import { NextResponse } from "next/server"
import { checkQuota, getOrCreateUser } from "@/src/services/billing"
import type { QuotaCheckResponse } from "@/src/types/billing"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id") || request.headers.get("x-user-id") || "demo_user"

    getOrCreateUser(userId)
    const result = checkQuota(userId)

    return NextResponse.json<QuotaCheckResponse>({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("[API] Quota check error:", error)
    return NextResponse.json<QuotaCheckResponse>({ success: false, error: "Failed to check quota" }, { status: 500 })
  }
}
