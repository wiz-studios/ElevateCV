import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { updateUserPlan, addCredits } from "@/src/services/billing"
import { logAuditEvent } from "@/src/services/audit"
import type { PlanType } from "@/src/types/billing"
import type Stripe from "stripe"

// Webhook secret from Stripe dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, productId, type, plan, credits } = session.metadata || {}

        if (!userId) {
          console.error("[Stripe Webhook] No userId in metadata")
          break
        }

        if (type === "subscription" && plan) {
          // Handle subscription purchase
          const subscriptionId = session.subscription as string
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const expiryDate = new Date(subscription.current_period_end * 1000).toISOString()

          updateUserPlan(userId, plan as PlanType, expiryDate)

          logAuditEvent("billing.subscription_created", {
            userId,
            metadata: {
              plan,
              productId,
              subscriptionId,
              amount: session.amount_total,
            },
          })

          console.log(`[Stripe] User ${userId} subscribed to ${plan}`)
        } else if (type === "credits" && credits) {
          // Handle credit purchase
          const creditAmount = Number.parseInt(credits, 10)
          addCredits(userId, creditAmount)

          logAuditEvent("billing.credits_purchased", {
            userId,
            metadata: {
              credits: creditAmount,
              productId,
              amount: session.amount_total,
            },
          })

          console.log(`[Stripe] User ${userId} purchased ${creditAmount} credits`)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user by Stripe customer ID
        // TODO: Implement customer ID lookup when using real database
        console.log(`[Stripe] Subscription updated for customer ${customerId}`)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Downgrade user to free plan
        // TODO: Implement customer ID lookup when using real database
        logAuditEvent("billing.subscription_cancelled", {
          metadata: { customerId, subscriptionId: subscription.id },
        })

        console.log(`[Stripe] Subscription cancelled for customer ${customerId}`)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Stripe] Payment failed for invoice ${invoice.id}`)
        // TODO: Send email notification to user
        break
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
