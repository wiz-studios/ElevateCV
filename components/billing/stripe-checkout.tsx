"use client"

import { useCallback, useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createCheckoutSession } from "@/app/actions/stripe"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  productId: string
  productName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function StripeCheckout({ productId, productName, open, onOpenChange, onSuccess }: StripeCheckoutProps) {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchClientSecret = useCallback(async () => {
    if (!user) {
      throw new Error("Please log in to continue")
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await createCheckoutSession(productId, user.id, user.email)

      if (result.error || !result.clientSecret) {
        throw new Error(result.error || "Failed to create checkout session")
      }

      return result.clientSecret
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [productId, user])

  const handleComplete = useCallback(() => {
    onSuccess?.()
    onOpenChange(false)
  }, [onSuccess, onOpenChange])

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>Please log in or create an account to purchase {productName}.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button asChild>
              <a href="/login">Log in</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete your purchase</DialogTitle>
          <DialogDescription>Purchasing: {productName}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        <div id="checkout" className="min-h-[400px]">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{
              fetchClientSecret,
              onComplete: handleComplete,
            }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}
