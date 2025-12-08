/**
 * Paystack Payment Initialization API Route
 * 
 * Initializes a Paystack payment transaction for subscriptions or one-time purchases.
 * Returns a payment URL that the user is redirected to for completing payment.
 * 
 * @route POST /api/paystack/initialize
 * @access Protected - Requires authentication
 * 
 * @param {Object} request.body
 * @param {string} request.body.productId - Product ID (e.g., "premium_monthly", "credits_15")
 * 
 * @returns {Object} JSON response with payment authorization URL
 * @returns {string} authorization_url - Paystack payment URL to redirect user to
 * @returns {string} reference - Transaction reference for tracking
 * 
 * @example
 * // Request
 * POST /api/paystack/initialize
 * Content-Type: application/json
 * {
 *   "productId": "premium_monthly"
 * }
 * 
 * // Response
 * {
 *   "authorization_url": "https://checkout.paystack.com/...",
 *   "reference": "ref_abc123",
 *   "access_code": "..."
 * }
 * 
 * @workflow
 * 1. Authenticate user
 * 2. Get product details and pricing
 * 3. Initialize Paystack transaction
 * 4. Return payment URL for redirect
 * 
 * @security
 * - Requires valid Supabase session
 * - Uses secret key server-side only
 * - Metadata includes userId for webhook processing
 */

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PRODUCTS, toCents } from "@/lib/paystack"

export async function POST(request: Request) {
    try {
        // Parse request body
        const { productId } = await request.json()

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID required" },
                { status: 400 }
            )
        }

        // Authenticate the user
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get user's profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        }

        // Get product configuration
        const product = PRODUCTS.find((p) => p.id === productId)

        if (!product) {
            return NextResponse.json({ error: "Invalid product" }, { status: 400 })
        }

        // Convert amount to cents (Paystack uses smallest currency unit)
        const amountInCents = toCents(product.price)

        // Build metadata for webhook processing
        const metadata = {
            userId: user.id,
            productId,
            type: product.type,
            ...(product.type === "subscription" && "plan" in product && { plan: product.plan }),
            ...(product.type === "credits" && "credits" in product && { credits: product.credits }),
        }

        // Initialize Paystack transaction
        const response = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: profile.email || user.email!,
                amount: amountInCents,
                currency: "USD",
                metadata,
                // Callback URLs
                callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/verify`,
                // Custom fields for additional data
                custom_fields: [
                    {
                        display_name: "Product",
                        variable_name: "product_name",
                        value: product.name,
                    },
                ],
            }),
        })

        const data = await response.json()

        // Handle Paystack API errors
        if (!data.status) {
            console.error("[Paystack] Initialize failed:", data.message)
            return NextResponse.json(
                { error: data.message || "Payment initialization failed" },
                { status: 400 }
            )
        }

        // Log successful initialization
        console.log(
            `[Paystack] Initialized transaction ${data.data.reference} for user ${user.id}`
        )

        // Return payment URL and reference
        return NextResponse.json({
            authorization_url: data.data.authorization_url,
            reference: data.data.reference,
            access_code: data.data.access_code,
        })
    } catch (error) {
        console.error("[Paystack] Initialize error:", error)
        return NextResponse.json(
            { error: "Failed to initialize payment" },
            { status: 500 }
        )
    }
}
