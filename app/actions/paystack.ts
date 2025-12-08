"use server"

import { initializePayment, createCustomer, getCustomer } from "@/lib/paystack-server"
import { PRODUCTS, toCents } from "@/lib/paystack"

/**
 * Create a Paystack payment initialization for subscriptions or credits
 */
export async function createPaystackCheckout(
    productId: string,
    userId: string,
    userEmail: string,
): Promise<{ authorization_url: string | null; reference: string | null; error?: string }> {
    try {
        const product = PRODUCTS.find((p) => p.id === productId)
        if (!product) {
            return { authorization_url: null, reference: null, error: "Product not found" }
        }

        // Generate unique reference
        const reference = `${productId}_${userId}_${Date.now()}`

        // Convert price to cents
        const amountInCents = toCents(product.price)

        // Initialize payment
        const response = await initializePayment({
            email: userEmail,
            amount: amountInCents,
            reference,
            metadata: {
                userId,
                productId,
                type: product.type,
                plan: "plan" in product ? product.plan : undefined,
                credits: "credits" in product ? product.credits : undefined,
            },
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?reference=${reference}`,
        })

        return {
            authorization_url: response.data.authorization_url,
            reference: response.data.reference,
        }
    } catch (error) {
        console.error("[Paystack] Checkout initialization error:", error)
        return {
            authorization_url: null,
            reference: null,
            error: error instanceof Error ? error.message : "Failed to initialize payment",
        }
    }
}

/**
 * Get or create Paystack customer for a user
 */
export async function getOrCreatePaystackCustomer(
    userId: string,
    email: string,
    firstName?: string,
    lastName?: string,
): Promise<{ customerCode: string | null; error?: string }> {
    try {
        // Try to get existing customer
        try {
            const customer = await getCustomer(email)
            if (customer.data) {
                return { customerCode: customer.data.customer_code }
            }
        } catch (error) {
            // Customer doesn't exist, create new one
        }

        // Create new customer
        const customer = await createCustomer({
            email,
            first_name: firstName,
            last_name: lastName,
        })

        return { customerCode: customer.data.customer_code }
    } catch (error) {
        console.error("[Paystack] Customer error:", error)
        return {
            customerCode: null,
            error: error instanceof Error ? error.message : "Failed to get/create customer",
        }
    }
}
