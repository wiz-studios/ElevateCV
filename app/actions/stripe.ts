"use server"

import { stripe, PRODUCTS } from "@/lib/stripe"

/**
 * Create a Stripe Checkout session for subscriptions or credits
 */
export async function createCheckoutSession(
  productId: string,
  userId: string,
  userEmail: string,
): Promise<{ clientSecret: string | null; error?: string }> {
  try {
    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) {
      return { clientSecret: null, error: "Product not found" }
    }

    const isSubscription = product.type === "subscription"

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      redirect_on_completion: "never",
      customer_email: userEmail,
      metadata: {
        userId,
        productId,
        type: product.type,
        plan: "plan" in product ? product.plan : undefined,
        credits: "credits" in product ? String(product.credits) : undefined,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.priceInCents,
            ...(isSubscription && "interval" in product
              ? {
                  recurring: {
                    interval: product.interval,
                  },
                }
              : {}),
          },
          quantity: 1,
        },
      ],
      mode: isSubscription ? "subscription" : "payment",
    })

    return { clientSecret: session.client_secret }
  } catch (error) {
    console.error("[Stripe] Checkout session error:", error)
    return {
      clientSecret: null,
      error: error instanceof Error ? error.message : "Failed to create checkout session",
    }
  }
}

/**
 * Create a Stripe Customer Portal session for managing subscriptions
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<{ url: string | null; error?: string }> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return { url: session.url }
  } catch (error) {
    console.error("[Stripe] Portal session error:", error)
    return {
      url: null,
      error: error instanceof Error ? error.message : "Failed to create portal session",
    }
  }
}

/**
 * Get or create Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
): Promise<{ customerId: string | null; error?: string }> {
  try {
    // Search for existing customer by email
    const customers = await stripe.customers.list({ email, limit: 1 })

    if (customers.data.length > 0) {
      return { customerId: customers.data[0].id }
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    })

    return { customerId: customer.id }
  } catch (error) {
    console.error("[Stripe] Customer error:", error)
    return {
      customerId: null,
      error: error instanceof Error ? error.message : "Failed to get/create customer",
    }
  }
}
