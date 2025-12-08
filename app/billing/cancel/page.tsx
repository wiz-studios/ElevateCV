/**
 * Checkout Cancel Page
 * 
 * Displayed when a user cancels the Stripe Checkout process.
 * Provides reassurance and navigation options to continue browsing.
 * 
 * @page /billing/cancel
 * @access Public
 * 
 * @workflow
 * 1. User clicks "Back" or closes Stripe Checkout
 * 2. Stripe redirects to this page
 * 3. User sees cancellation message
 * 4. User can return to pricing or home page
 * 
 * @notes
 * - No payment was processed
 * - No charges were made
 * - User can retry checkout anytime
 * - Checkout session expires automatically
 * 
 * @security
 * - No sensitive data is displayed
 * - No database changes occur
 * - Safe to access without authentication
 */

import Link from "next/link"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        {/* Cancel Icon and Title */}
        <CardHeader className="text-center">
          {/* Orange X icon (not red, to avoid alarm) */}
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
          </div>
          
          <CardTitle className="text-2xl">Checkout Cancelled</CardTitle>
          <CardDescription>
            Your payment was not processed
          </CardDescription>
        </CardHeader>

        {/* Reassurance Message and Actions */}
        <CardContent className="space-y-4">
          {/* Reassuring message - no charges made */}
          <p className="text-sm text-muted-foreground text-center">
            No charges were made to your account. You can try again whenever you're ready.
          </p>

          {/* Navigation buttons */}
          <div className="flex flex-col gap-2">
            {/* Primary action: Return to pricing */}
            <Button asChild className="w-full">
              <Link href="/pricing">View Plans</Link>
            </Button>

            {/* Secondary action: Return to home */}
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
