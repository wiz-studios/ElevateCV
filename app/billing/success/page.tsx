/**
 * Checkout Success Page
 * 
 * Displayed after a user successfully completes a Stripe Checkout session.
 * Shows confirmation message and provides navigation options.
 * 
 * @page /billing/success
 * @access Public (but only shown after successful checkout)
 * 
 * @query {string} [session_id] - Stripe Checkout session ID (optional, for tracking)
 * 
 * @workflow
 * 1. User completes payment on Stripe Checkout
 * 2. Stripe redirects to this page with session_id
 * 3. Webhook processes payment in background
 * 4. User sees success message
 * 5. User can navigate to app or billing page
 * 
 * @notes
 * - Payment processing happens via webhook, not on this page
 * - Database updates may take a few seconds to complete
 * - Session ID can be used for order tracking/support
 * - This page is purely informational
 * 
 * @security
 * - No sensitive data is displayed
 * - Session ID is safe to expose (it's a public identifier)
 * - Actual payment verification happens server-side via webhook
 */

import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                {/* Success Icon and Title */}
                <CardHeader className="text-center">
                    {/* Green checkmark icon */}
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>

                    <CardTitle className="text-2xl">Payment Successful!</CardTitle>
                    <CardDescription>
                        Your subscription has been activated
                    </CardDescription>
                </CardHeader>

                {/* Success Message and Actions */}
                <CardContent className="space-y-4">
                    {/* Informational message */}
                    <p className="text-sm text-muted-foreground text-center">
                        Thank you for subscribing to ElevateCV. Your account has been upgraded and you can now access all premium features.
                    </p>

                    {/* Navigation buttons */}
                    <div className="flex flex-col gap-2">
                        {/* Primary action: Start using the app */}
                        <Button asChild className="w-full">
                            <Link href="/">Start Building Resumes</Link>
                        </Button>

                        {/* Secondary action: View billing details */}
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/billing">View Billing</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
