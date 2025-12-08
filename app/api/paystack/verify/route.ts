/**
 * Paystack Payment Verification API Route
 * 
 * Verifies a Paystack payment after user is redirected back from checkout.
 * Checks payment status and returns result to display success/failure page.
 * 
 * @route GET /api/paystack/verify
 * @access Protected - Requires authentication
 * 
 * @query {string} reference - Paystack transaction reference
 * 
 * @returns {Object} JSON response with verification result
 * @returns {boolean} success - Whether payment was successful
 * @returns {Object} data - Payment data from Paystack
 * 
 * @example
 * // Request
 * GET /api/paystack/verify?reference=ref_abc123
 * 
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "status": "success",
 *     "reference": "ref_abc123",
 *     "amount": 500000,
 *     ...
 *   }
 * }
 * 
 * @workflow
 * 1. Get reference from query params
 * 2. Call Paystack verify endpoint
 * 3. Return verification result
 * 
 * @security
 * - Requires authentication
 * - Uses secret key server-side
 * - Webhook handles actual database updates
 */

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
    try {
        // Get reference from query params
        const { searchParams } = new URL(request.url)
        const reference = searchParams.get("reference")

        if (!reference) {
            return NextResponse.json(
                { error: "Reference required" },
                { status: 400 }
            )
        }

        // Authenticate user
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify transaction with Paystack
        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        )

        const data = await response.json()

        // Handle Paystack API errors
        if (!data.status) {
            console.error("[Paystack] Verification failed:", data.message)
            return NextResponse.json(
                { success: false, error: data.message },
                { status: 400 }
            )
        }

        // Log verification
        console.log(
            `[Paystack] Verified transaction ${reference}: ${data.data.status}`
        )

        // Return verification result
        return NextResponse.json({
            success: data.data.status === "success",
            data: data.data,
        })
    } catch (error) {
        console.error("[Paystack] Verify error:", error)
        return NextResponse.json(
            { error: "Failed to verify payment" },
            { status: 500 }
        )
    }
}
