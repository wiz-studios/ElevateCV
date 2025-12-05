"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    FileText,
    ArrowLeft,
    Check,
    CreditCard,
    Lock,
    Crown,
    Zap,
    Building2,
    Loader2
} from "lucide-react"

const PLANS = {
    premium: {
        name: "Premium",
        monthlyPrice: 9.99,
        yearlyPrice: 79.99,
        icon: Crown,
        features: [
            "Unlimited AI-tailored resumes",
            "Advanced ATS scoring & insights",
            "Priority PDF export",
            "Premium templates",
            "Cover letter generator",
            "LinkedIn optimization",
            "Email support",
        ],
    },
    enterprise: {
        name: "Enterprise",
        monthlyPrice: 49.99,
        yearlyPrice: 399.99,
        icon: Building2,
        features: [
            "Everything in Premium",
            "Multi-user support",
            "Team analytics",
            "Custom branding",
            "API access",
            "Dedicated support",
            "SSO integration",
            "100 bonus credits included",
        ],
    },
}

const CREDIT_PACKAGES = {
    credits_5: { name: "5 Credits", credits: 5, price: 4.99 },
    credits_15: { name: "15 Credits", credits: 15, price: 9.99 },
    credits_50: { name: "50 Credits", credits: 50, price: 24.99 },
}

export default function CheckoutPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()

    const [checkoutType, setCheckoutType] = useState<"subscription" | "credits">("subscription")
    const [selectedPlan, setSelectedPlan] = useState<string>("premium")
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
    const [selectedCredits, setSelectedCredits] = useState<string>("credits_15")
    const [processing, setProcessing] = useState(false)
    const [promoCode, setPromoCode] = useState("")

    useEffect(() => {
        // Parse URL parameters
        const type = searchParams.get("type")
        const item = searchParams.get("item")

        if (type === "credits") {
            setCheckoutType("credits")
            if (item && CREDIT_PACKAGES[item as keyof typeof CREDIT_PACKAGES]) {
                setSelectedCredits(item)
            }
        } else if (type === "subscription") {
            setCheckoutType("subscription")
            if (item && PLANS[item as keyof typeof PLANS]) {
                setSelectedPlan(item)
            }
        }

        // Redirect if not authenticated
        if (!isAuthenticated) {
            const returnUrl = `/checkout?type=${type || "subscription"}&item=${item || "premium"}`
            router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`)
        }
    }, [searchParams, isAuthenticated, router])

    const handleCheckout = async () => {
        setProcessing(true)

        // TODO: Implement actual Stripe checkout
        // This would create a Stripe checkout session and redirect
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call

            // In production, this would be:
            // const response = await fetch('/api/stripe/create-checkout-session', {
            //   method: 'POST',
            //   body: JSON.stringify({
            //     type: checkoutType,
            //     plan: selectedPlan,
            //     billingCycle,
            //     credits: selectedCredits,
            //     promoCode,
            //   })
            // })
            // const { url } = await response.json()
            // window.location.href = url

            console.log("Checkout initiated:", {
                type: checkoutType,
                plan: selectedPlan,
                billingCycle,
                credits: selectedCredits,
                promoCode,
            })

            // For demo, show success message
            alert("Checkout would redirect to Stripe here. This is a demo.")
        } catch (error) {
            console.error("Checkout error:", error)
            alert("Checkout failed. Please try again.")
        } finally {
            setProcessing(false)
        }
    }

    const calculateTotal = () => {
        if (checkoutType === "subscription") {
            const plan = PLANS[selectedPlan as keyof typeof PLANS]
            return billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
        } else {
            const pkg = CREDIT_PACKAGES[selectedCredits as keyof typeof CREDIT_PACKAGES]
            return pkg.price
        }
    }

    const calculateSavings = () => {
        if (checkoutType === "subscription" && billingCycle === "yearly") {
            const plan = PLANS[selectedPlan as keyof typeof PLANS]
            const monthlyTotal = plan.monthlyPrice * 12
            const yearlySavings = monthlyTotal - plan.yearlyPrice
            return yearlySavings.toFixed(2)
        }
        return null
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Redirecting to login...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">ElevateCV</h1>
                        </div>
                    </Link>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/pricing">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Pricing
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Complete Your Purchase</h1>
                    <p className="text-muted-foreground">Secure checkout powered by Stripe</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Type Selection */}
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle>What would you like to purchase?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={checkoutType} onValueChange={(value) => setCheckoutType(value as "subscription" | "credits")}>
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                        <RadioGroupItem value="subscription" id="subscription" />
                                        <Label htmlFor="subscription" className="flex-1 cursor-pointer">
                                            <div className="font-medium">Subscription Plan</div>
                                            <div className="text-sm text-muted-foreground">Unlimited access with monthly or yearly billing</div>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                        <RadioGroupItem value="credits" id="credits" />
                                        <Label htmlFor="credits" className="flex-1 cursor-pointer">
                                            <div className="font-medium">Credit Package</div>
                                            <div className="text-sm text-muted-foreground">Pay as you go, credits never expire</div>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        {/* Plan/Credit Selection */}
                        {checkoutType === "subscription" ? (
                            <Card className="border-none shadow-lg">
                                <CardHeader>
                                    <CardTitle>Select Your Plan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                                        {Object.entries(PLANS).map(([key, plan]) => {
                                            const Icon = plan.icon
                                            const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
                                            return (
                                                <div key={key} className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                    <RadioGroupItem value={key} id={key} className="mt-1" />
                                                    <Label htmlFor={key} className="flex-1 cursor-pointer">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Icon className="h-5 w-5 text-primary" />
                                                            <span className="font-semibold text-lg">{plan.name}</span>
                                                            <span className="ml-auto text-xl font-bold">${price.toFixed(2)}</span>
                                                            <span className="text-muted-foreground">/{billingCycle === "yearly" ? "year" : "month"}</span>
                                                        </div>
                                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                                            {plan.features.slice(0, 3).map((feature, i) => (
                                                                <li key={i} className="flex items-center gap-2">
                                                                    <Check className="h-3 w-3 text-primary" />
                                                                    {feature}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </Label>
                                                </div>
                                            )
                                        })}
                                    </RadioGroup>

                                    <Separator />

                                    <div>
                                        <Label className="mb-3 block">Billing Cycle</Label>
                                        <RadioGroup value={billingCycle} onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}>
                                            <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="monthly" id="monthly" />
                                                <Label htmlFor="monthly" className="flex-1 cursor-pointer">Monthly</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="yearly" id="yearly" />
                                                <Label htmlFor="yearly" className="flex-1 cursor-pointer">
                                                    <div className="flex items-center gap-2">
                                                        Yearly
                                                        <Badge variant="secondary" className="ml-2">Save 33%</Badge>
                                                    </div>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-none shadow-lg">
                                <CardHeader>
                                    <CardTitle>Select Credit Package</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup value={selectedCredits} onValueChange={setSelectedCredits}>
                                        {Object.entries(CREDIT_PACKAGES).map(([key, pkg]) => (
                                            <div key={key} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value={key} id={key} />
                                                <Label htmlFor={key} className="flex-1 cursor-pointer">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Zap className="h-5 w-5 text-primary" />
                                                            <span className="font-semibold">{pkg.name}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xl font-bold">${pkg.price}</div>
                                                            <div className="text-xs text-muted-foreground">${(pkg.price / pkg.credits).toFixed(2)} per credit</div>
                                                        </div>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        )}

                        {/* Promo Code */}
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-base">Have a promo code?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter promo code"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                    />
                                    <Button variant="outline">Apply</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="lg:col-span-1">
                        <Card className="border-none shadow-lg sticky top-24">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {checkoutType === "subscription"
                                                ? `${PLANS[selectedPlan as keyof typeof PLANS].name} (${billingCycle})`
                                                : CREDIT_PACKAGES[selectedCredits as keyof typeof CREDIT_PACKAGES].name
                                            }
                                        </span>
                                        <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                                    </div>

                                    {calculateSavings() && (
                                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                            <span>Yearly savings</span>
                                            <span>-${calculateSavings()}</span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>${calculateTotal().toFixed(2)}</span>
                                </div>

                                <div className="text-xs text-muted-foreground text-center">
                                    <Lock className="h-3 w-3 inline mr-1" />
                                    Secure payment powered by Stripe
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-3">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleCheckout}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Proceed to Payment
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    7-day money-back guarantee • Cancel anytime
                                </p>
                            </CardFooter>
                        </Card>

                        {/* Trust Badges */}
                        <Card className="border-none shadow-lg mt-6 bg-muted/30">
                            <CardContent className="p-4 space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>SSL encrypted checkout</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>PCI compliant payments</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Money-back guarantee</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
