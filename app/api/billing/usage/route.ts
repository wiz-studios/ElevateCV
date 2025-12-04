/**
 * GET /api/billing/usage
 * Returns user's billing usage, plan info, and quota
 */

import { NextResponse } from "next/server"
import { getBillingUsage, getOrCreateUser } from "@/src/services/billing"
import type { BillingUsageResponse } from "@/src/types/billing"

export async function GET(request: Request) {
  try {
    // Get user ID from header or query param
    // In production, get from authenticated session
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id") || request.headers.get("x-user-id") || `demo_${Date.now()}`

    const usage = await getBillingUsage(userId)

    return NextResponse.json<BillingUsageResponse>({
      success: true,
      data: usage,
    })
  } catch (error) {
    console.error("[API] Billing usage error:", error)
    return NextResponse.json<BillingUsageResponse>(
      { success: false, error: "Failed to fetch billing usage" },
      { status: 500 },
    )
  }
}
