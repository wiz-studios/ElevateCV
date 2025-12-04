/**
 * POST /api/billing/purchase
 * Initiate purchase for subscription or credits
 */

import { type NextRequest, NextResponse } from "next/server"
import { createCheckoutUrl, getOrCreateUser, PLANS, CREDIT_PACKAGES } from "@/src/services/billing"
import type { PurchaseRequest, PurchaseResponse, PlanType } from "@/src/types/billing"

export async function POST(request: NextRequest) {
  try {
    const body: PurchaseRequest = await request.json()

    // Get user ID - in production, get from authenticated session
    const userId = body.user_id || request.headers.get("x-user-id") || "demo_user"

    // Validate request
    if (!body.type) {
      return NextResponse.json<PurchaseResponse>(
        { success: false, error: "Purchase type required (subscription or credits)" },
        { status: 400 },
      )
    }

    // Ensure user exists
    getOrCreateUser(userId)

    if (body.type === "subscription") {
      const plan = body.plan as PlanType
      if (!plan || !PLANS[plan]) {
        return NextResponse.json<PurchaseResponse>({ success: false, error: "Invalid plan type" }, { status: 400 })
      }

      if (plan === "free") {
        return NextResponse.json<PurchaseResponse>(
          { success: false, error: "Cannot purchase free plan" },
          { status: 400 },
        )
      }

      const checkoutUrl = createCheckoutUrl(userId, "subscription", `${plan}_${body.billing_period || "monthly"}`)

      return NextResponse.json<PurchaseResponse>({
        success: true,
        checkout_url: checkoutUrl,
      })
    }

    if (body.type === "credits") {
      const packageId = body.credit_package_id
      const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId)

      if (!pkg) {
        return NextResponse.json<PurchaseResponse>({ success: false, error: "Invalid credit package" }, { status: 400 })
      }

      const checkoutUrl = createCheckoutUrl(userId, "credits", packageId)

      return NextResponse.json<PurchaseResponse>({
        success: true,
        checkout_url: checkoutUrl,
      })
    }

    return NextResponse.json<PurchaseResponse>({ success: false, error: "Invalid purchase type" }, { status: 400 })
  } catch (error) {
    console.error("[API] Purchase error:", error)
    return NextResponse.json<PurchaseResponse>({ success: false, error: "Failed to process purchase" }, { status: 500 })
  }
}
