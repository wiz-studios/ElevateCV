/**
 * Paystack Webhook Handler
 * 
 * Processes Paystack webhook events to update user subscriptions and credits.
 * Verifies webhook signatures and handles payment success/failure events.
 * 
 * @route POST /api/paystack/webhook
 * @access Public (but signature-verified)
 * 
 * @security
 * - Verifies x-paystack-signature header
 * - Uses PAYSTACK_WEBHOOK_SECRET for validation
 * - Idempotent processing with reference tracking
 * 
 * @events
 * - charge.success - Payment completed successfully
 * - subscription.create - New subscription created
 * - subscription.disable - Subscription cancelled
 * - subscription.not_renew - Subscription won't renew
 * 
 * @workflow
 * 1. Verify webhook signature
 * 2. Parse event data
 * 3. Update database based on event type
 * 4. Log transaction for audit trail
 */

import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { addCredits, updateUserPlan } from "@/src/services/billing"
import { logAuditEvent } from "@/src/services/audit"
import type { PlanType } from "@/src/types/billing"
import crypto from "crypto"

// Webhook secret from Paystack dashboard
const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET!

/**
 * Verify Paystack webhook signature
 * @param body Raw request body
 * @param signature Signature from x-paystack-signature header
 * @returns boolean indicating if signature is valid
 */
function verifySignature(body: string, signature: string): boolean {
    const hash = crypto
        .createHmac("sha512", webhookSecret)
        .update(body)
        .digest("hex")
    return hash === signature
}

export async function POST(request: Request) {
    try {
        // Get raw body for signature verification
        const body = await request.text()
        const signature = request.headers.get("x-paystack-signature")

        if (!signature) {
            console.error("[Paystack Webhook] Missing signature header")
            return NextResponse.json({ error: "No signature" }, { status: 400 })
        }

        // Verify webhook signature
        if (!verifySignature(body, signature)) {
            console.error("[Paystack Webhook] Invalid signature")
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
        }

        // Parse webhook event
        const event = JSON.parse(body)
        console.log(`[Paystack Webhook] Received event: ${event.event}`)

        const supabase = createAdminClient()

        // Handle different event types
        switch (event.event) {
            // ============================================
            // PAYMENT SUCCESS
            // ============================================
            case "charge.success": {
                const { reference, customer, metadata, amount } = event.data

                if (!metadata?.userId) {
                    console.error("[Paystack] No userId in metadata")
                    break
                }

                const userId = metadata.userId
                const productType = metadata.type
                const productId = metadata.productId

                // Check if already processed (idempotency)
                const { data: existingLog } = await supabase
                    .from("usage_logs")
                    .select("id")
                    .eq("metadata->>reference", reference)
                    .single()

                if (existingLog) {
                    console.log(`[Paystack] Already processed reference ${reference}`)
                    return NextResponse.json({ received: true })
                }

                // Handle subscription payment
                if (productType === "subscription") {
                    const plan = metadata.plan as PlanType

                    // Calculate subscription expiry (30 days for monthly, 365 for yearly)
                    const expiryDate = new Date()
                    if (metadata.interval === "year") {
                        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
                    } else {
                        expiryDate.setMonth(expiryDate.getMonth() + 1)
                    }

                    // Update user plan and premium_until
                    await updateUserPlan(userId, plan, expiryDate.toISOString())

                    // Update Paystack customer info
                    await supabase
                        .from("profiles")
                        .update({
                            paystack_customer_code: customer.customer_code,
                            premium_until: expiryDate.toISOString(),
                            last_payment_reference: reference,
                        })
                        .eq("id", userId)

                    // Log subscription purchase
                    await logAuditEvent("billing.subscription_created", {
                        userId,
                        metadata: {
                            plan,
                            productId,
                            reference,
                            amount,
                        },
                    })

                    console.log(`[Paystack] User ${userId} subscribed to ${plan}`)
                }

                // Handle credit purchase
                else if (productType === "credits") {
                    const credits = parseInt(metadata.credits, 10)

                    // Add credits to user account
                    await addCredits(userId, credits)

                    // Update payment reference
                    await supabase
                        .from("profiles")
                        .update({
                            paystack_customer_code: customer.customer_code,
                            last_payment_reference: reference,
                        })
                        .eq("id", userId)

                    // Log credit purchase
                    await logAuditEvent("billing.credits_purchased", {
                        userId,
                        metadata: {
                            credits,
                            productId,
                            reference,
                            amount,
                        },
                    })

                    console.log(`[Paystack] User ${userId} purchased ${credits} credits`)
                }

                break
            }

            // ============================================
            // SUBSCRIPTION CREATED
            // ============================================
            case "subscription.create": {
                const { subscription_code, customer, plan } = event.data

                // Find user by customer code
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("paystack_customer_code", customer.customer_code)
                    .single()

                if (profile) {
                    await supabase
                        .from("profiles")
                        .update({
                            paystack_subscription_code: subscription_code,
                        })
                        .eq("id", profile.id)

                    console.log(`[Paystack] Subscription created for user ${profile.id}`)
                }

                break
            }

            // ============================================
            // SUBSCRIPTION DISABLED
            // ============================================
            case "subscription.disable": {
                const { subscription_code, customer } = event.data

                // Find user by subscription code
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("id, plan")
                    .eq("paystack_subscription_code", subscription_code)
                    .single()

                if (profile) {
                    // Downgrade to free plan
                    await updateUserPlan(profile.id, "free")

                    await supabase
                        .from("profiles")
                        .update({
                            paystack_subscription_code: null,
                            premium_until: null,
                        })
                        .eq("id", profile.id)

                    await logAuditEvent("billing.subscription_cancelled", {
                        userId: profile.id,
                        metadata: {
                            subscription_code,
                            previousPlan: profile.plan,
                        },
                    })

                    console.log(`[Paystack] Subscription cancelled for user ${profile.id}`)
                }

                break
            }

            // ============================================
            // UNHANDLED EVENTS
            // ============================================
            default:
                console.log(`[Paystack] Unhandled event type: ${event.event}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("[Paystack Webhook] Error processing event:", error)
        // Return 200 to prevent Paystack from retrying
        return NextResponse.json(
            { error: "Webhook handler failed", received: true },
            { status: 200 }
        )
    }
}
