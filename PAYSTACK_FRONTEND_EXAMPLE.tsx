/**
 * Paystack Frontend Integration Example
 * 
 * This file shows how to integrate Paystack checkout in your React components.
 * Copy and adapt these patterns to your billing/pricing pages.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

/**
 * Example: Pricing Card Component with Paystack Checkout
 */
export function PaystackCheckoutButton({
    productId,
    productName
}: {
    productId: string
    productName: string
}) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleCheckout = async () => {
        try {
            setLoading(true)

            // Call your API to initialize payment
            const response = await fetch('/api/paystack/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initialize payment')
            }

            // Redirect to Paystack checkout
            if (data.authorization_url) {
                window.location.href = data.authorization_url
            } else {
                throw new Error('No authorization URL received')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            toast({
                title: 'Payment Error',
                description: error instanceof Error ? error.message : 'Failed to start checkout',
                variant: 'destructive',
            })
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full"
        >
            {loading ? 'Processing...' : `Subscribe to ${productName}`}
        </Button>
    )
}

/**
 * Example: Payment Verification Page
 * Use this pattern in your /billing/verify page
 */
export function PaymentVerificationPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    // Get reference from URL
    const searchParams = new URLSearchParams(window.location.search)
    const reference = searchParams.get('reference')

    // Verify payment on mount
    React.useEffect(() => {
        if (!reference) {
            setStatus('error')
            setMessage('No payment reference found')
            return
        }

        verifyPayment(reference)
    }, [reference])

    const verifyPayment = async (ref: string) => {
        try {
            const response = await fetch(`/api/paystack/verify?reference=${ref}`)
            const data = await response.json()

            if (data.success) {
                setStatus('success')
                setMessage('Payment successful! Your account has been upgraded.')

                // Redirect to success page after 2 seconds
                setTimeout(() => {
                    window.location.href = '/billing/success'
                }, 2000)
            } else {
                setStatus('error')
                setMessage(data.error || 'Payment verification failed')
            }
        } catch (error) {
            setStatus('error')
            setMessage('Failed to verify payment')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            {status === 'loading' && <p>Verifying payment...</p>}
            {status === 'success' && <p className="text-green-600">{message}</p>}
            {status === 'error' && <p className="text-red-600">{message}</p>}
        </div>
    )
}

/**
 * Example: Inline Paystack Popup (Alternative to redirect)
 * 
 * If you prefer a popup instead of redirect, use Paystack Inline:
 */
export function PaystackInlineCheckout({
    productId
}: {
    productId: string
}) {
    const handleCheckout = async () => {
        try {
            // Initialize payment
            const response = await fetch('/api/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            })

            const data = await response.json()

            // Use Paystack Inline (requires adding Paystack script to your page)
            const handler = (window as any).PaystackPop.setup({
                key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
                email: data.email,
                amount: data.amount,
                ref: data.reference,
                onClose: function () {
                    alert('Payment window closed')
                },
                callback: function (response: any) {
                    // Payment complete, verify on backend
                    window.location.href = `/billing/verify?reference=${response.reference}`
                }
            })

            handler.openIframe()
        } catch (error) {
            console.error('Checkout error:', error)
        }
    }

    return <Button onClick={handleCheckout}>Pay with Paystack</Button>
}

/**
 * Add this to your layout or page to use Paystack Inline:
 * 
 * <Script src="https://js.paystack.co/v1/inline.js" />
 */

/**
 * Example: Product Pricing Configuration
 * Import from lib/paystack.ts
 */
import { PRODUCTS } from '@/lib/paystack'

export function PricingCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRODUCTS.map((product) => (
                <div key={product.id} className="border rounded-lg p-6">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p className="text-2xl font-bold">
                        ${product.price.toFixed(2)}
                        {product.type === 'subscription' && `/${product.interval}`}
                    </p>
                    <PaystackCheckoutButton
                        productId={product.id}
                        productName={product.name}
                    />
                </div>
            ))}
        </div>
    )
}

/**
 * Migration Notes:
 * 
 * 1. Find all Stripe checkout components
 * 2. Replace with Paystack patterns above
 * 3. Update imports from '@stripe/*' to '@/lib/paystack'
 * 4. Change API calls from '/api/stripe/*' to '/api/paystack/*'
 * 5. Update success/cancel URLs
 * 6. Test thoroughly with test cards
 */
