"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Check, FileText, Crown, Zap, Building2, ArrowLeft } from "lucide-react"

const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out the platform",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["3 AI-tailored resumes per month", "Basic ATS scoring", "PDF export", "Standard templates"],
    icon: FileText,
    cta: "Get Started",
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    description: "For active job seekers",
    monthlyPrice: 9.99,
    yearlyPrice: 79.99,
    features: [
      "Unlimited AI-tailored resumes",
      "Advanced ATS scoring & insights",
      "Priority PDF export",
      "Premium templates",
      "Cover letter generator",
      "LinkedIn optimization",
      "Email support",
    ],
    icon: Crown,
    cta: "Upgrade to Premium",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For teams and organizations",
    monthlyPrice: 49.99,
    yearlyPrice: 399.99,
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
    icon: Building2,
    cta: "Contact Sales",
    popular: false,
  },
]

const CREDIT_PACKAGES = [
  { id: "credits_5", name: "5 Credits", credits: 5, price: 4.99 },
  { id: "credits_15", name: "15 Credits", credits: 15, price: 9.99, popular: true },
  { id: "credits_50", name: "50 Credits", credits: 50, price: 24.99 },
]

export default function PricingPage() {
  const { isAuthenticated, user } = useAuth()
  const [isYearly, setIsYearly] = useState(false)

  const handlePlanSelect = (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = `/signup?plan=${planId}`
      return
    }

    if (planId === "enterprise") {
      window.location.href = "mailto:sales@example.com?subject=Enterprise Plan Inquiry"
      return
    }

    // TODO: Integrate with Stripe checkout
    console.log("Selected plan:", planId, isYearly ? "yearly" : "monthly")
  }

  const handleCreditPurchase = (packageId: string) => {
    if (!isAuthenticated) {
      window.location.href = `/signup?credits=${packageId}`
      return
    }

    // TODO: Integrate with Stripe checkout
    console.log("Selected credit package:", packageId)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Pricing</h1>
              <p className="text-muted-foreground">Choose the plan that works for you</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Label htmlFor="billing-toggle" className={!isYearly ? "font-medium" : "text-muted-foreground"}>
            Monthly
          </Label>
          <Switch id="billing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
          <Label htmlFor="billing-toggle" className={isYearly ? "font-medium" : "text-muted-foreground"}>
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 33%
            </Badge>
          </Label>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
            const isCurrentPlan = user?.plan === plan.id

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg" : ""}`}
              >
                {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${price === 0 ? "0" : price.toFixed(2)}</span>
                    {price > 0 && <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isCurrentPlan}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {isCurrentPlan ? "Current Plan" : plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Credit Packages */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Need More Credits?</h2>
            <p className="text-muted-foreground">
              Purchase credit packs for additional AI tailors without a subscription
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card key={pkg.id} className={`relative ${pkg.popular ? "border-primary" : ""}`}>
                {pkg.popular && (
                  <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Best Value
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>${(pkg.price / pkg.credits).toFixed(2)} per credit</CardDescription>
                  <div className="text-3xl font-bold">${pkg.price}</div>
                </CardHeader>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => handleCreditPurchase(pkg.id)}
                  >
                    Buy Credits
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ or additional info */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <p className="text-muted-foreground">
            All plans include a 7-day money-back guarantee. Questions?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
