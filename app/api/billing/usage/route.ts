/**
 * GET /api/billing/usage
 * Returns user's billing usage, plan info, and quota
 */

import { type NextRequest, NextResponse } from "next/server"
import { getBillingUsage } from "@/src/services/billing"
import { optionalAuthMiddleware } from "@/src/middleware/auth"
import type { BillingUsageResponse } from "@/src/types/billing"

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user or return demo data
    const authUser = await optionalAuthMiddleware(request)

    if (!authUser) {
      // Return demo/guest data for unauthenticated users
      return NextResponse.json<BillingUsageResponse>({
        success: true,
        data: {
          user_id: "demo",
          plan: "free",
          plan_name: "Free",
          credits_remaining: 0,
          monthly_quota: 3,
          monthly_used: 0,
          quota_reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
          subscription_status: undefined,
          subscription_expiry: undefined,
          features: ["3 AI-tailored resumes per month", "Basic ATS scoring", "PDF export", "Standard templates"],
        },
      })
    }

    const usage = await getBillingUsage(authUser.id)

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
