/**
 * PaystackButton Component
 * 
 * A reusable client component that initiates Paystack payment flow.
 * Handles loading states, error handling, and redirects to Paystack checkout.
 * 
 * @component
 * @example
 * // Basic usage
 * <PaystackButton productId="premium_monthly">
 *   Subscribe to Premium
 * </PaystackButton>
 * 
 * @example
 * // With custom styling
 * <PaystackButton 
 *   productId="credits_15"
 *   variant="outline"
 *   size="lg"
 *   className="w-full"
 * >
 *   Buy 15 Credits
 * </PaystackButton>
 * 
 * @param {string} productId - Product identifier matching PRODUCTS in lib/paystack.ts
 * @param {React.ReactNode} [children="Pay Now"] - Button text/content
 * @param {string} [className] - Additional CSS classes
 * @param {"default"|"outline"|"ghost"|"gradient"} [variant="default"] - Button style variant
 * @param {"default"|"sm"|"lg"} [size="default"] - Button size
 * @param {boolean} [disabled=false] - Whether button is disabled
 * 
 * @workflow
 * 1. User clicks button
 * 2. Component calls /api/paystack/initialize
 * 3. Receives Paystack payment URL
 * 4. Redirects user to Paystack checkout
 * 5. User completes payment on Paystack
 * 6. Paystack redirects back to verify page
 * 7. Webhook processes payment and updates database
 * 
 * @security
 * - All payment processing happens on Paystack's secure servers
 * - No sensitive payment data touches our servers
 * - Session creation requires authentication (handled by API route)
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaystackButtonProps {
    /** Product ID from PRODUCTS array in lib/paystack.ts */
    productId: string
    /** Button content (text, icons, etc.) */
    children?: React.ReactNode
    /** Additional CSS classes for styling */
    className?: string
    /** Button visual variant */
    variant?: "default" | "outline" | "ghost" | "gradient"
    /** Button size */
    size?: "default" | "sm" | "lg"
    /** Whether button is disabled */
    disabled?: boolean
}

/**
 * PaystackButton Component
 * Initiates Paystack payment flow
 */
export function PaystackButton({
    productId,
    children = "Pay Now",
    className,
    variant = "default",
    size = "default",
    disabled = false,
}: PaystackButtonProps) {
    // Track loading state during payment initialization
    const [loading, setLoading] = useState(false)

    // Toast notifications for user feedback
    const { toast } = useToast()

    /**
     * Handles the payment initialization flow
     * 
     * @async
     * @throws {Error} If payment initialization fails
     */
    async function handlePayment() {
        // Set loading state to show spinner
        setLoading(true)

        try {
            // Call our API to initialize Paystack payment
            const response = await fetch("/api/paystack/initialize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId }),
            })

            const data = await response.json()

            // Handle API errors
            if (!response.ok) {
                throw new Error(data.error || "Failed to initialize payment")
            }

            // Verify we received a payment URL
            if (data.authorization_url) {
                // Redirect to Paystack checkout
                // User will complete payment on Paystack's secure page
                window.location.href = data.authorization_url
            } else {
                throw new Error("No payment URL returned")
            }
        } catch (error) {
            // Log error for debugging
            console.error("Payment error:", error)

            // Show user-friendly error message
            toast({
                title: "Payment Failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Unable to start payment. Please try again.",
                variant: "destructive",
            })

            // Reset loading state on error
            // (On success, user is redirected so this doesn't matter)
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handlePayment}
            disabled={loading || disabled}
            className={className}
            variant={variant}
            size={size}
        >
            {loading ? (
                <>
                    {/* Show spinner while initializing payment */}
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                </>
            ) : (
                children
            )}
        </Button>
    )
}
