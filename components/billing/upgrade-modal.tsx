"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Crown, Zap, Loader2 } from "lucide-react"
import { PLANS, CREDIT_PACKAGES } from "@/src/services/billing"
import type { PlanType } from "@/src/types/billing"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan?: PlanType
  quotaExceeded?: boolean
}

export function UpgradeModal({ open, onOpenChange, currentPlan = "free", quotaExceeded = false }: UpgradeModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handlePurchase = async (type: "subscription" | "credits", item: string) => {
    setIsLoading(item)

    try {
      const response = await fetch("/api/billing/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          plan: type === "subscription" ? item : undefined,
          billing_period: type === "subscription" ? billingPeriod : undefined,
          credit_package_id: type === "credits" ? item : undefined,
        }),
      })

      const result = await response.json()

      if (result.success && result.checkout_url) {
        // In production, redirect to Stripe checkout
        window.open(result.checkout_url, "_blank")
      }
    } catch (err) {
      console.error("Purchase failed:", err)
    } finally {
      setIsLoading(null)
    }
  }

  const yearlySavings = Math.round(
    ((PLANS.premium.monthly_price * 12 - PLANS.premium.yearly_price) / (PLANS.premium.monthly_price * 12)) * 100,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{quotaExceeded ? "Upgrade to Continue" : "Upgrade Your Plan"}</DialogTitle>
          <DialogDescription>
            {quotaExceeded
              ? "You've used all your free tailors this month. Upgrade or buy credits to continue."
              : "Get unlimited access and premium features to land your dream job faster."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="plans" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="credits">Buy Credits</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-4 space-y-4">
            {/* Billing Toggle */}
            <div className="flex justify-center gap-4 items-center">
              <span className={billingPeriod === "monthly" ? "font-medium" : "text-muted-foreground"}>Monthly</span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingPeriod === "yearly" ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === "yearly" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={billingPeriod === "yearly" ? "font-medium" : "text-muted-foreground"}>
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">
                  Save {yearlySavings}%
                </Badge>
              </span>
            </div>

            {/* Plan Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Premium Plan */}
              <Card className="relative border-primary">
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">Most Popular</Badge>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    Premium
                  </CardTitle>
                  <CardDescription>For active job seekers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      ${billingPeriod === "monthly" ? PLANS.premium.monthly_price : PLANS.premium.yearly_price}
                    </span>
                    <span className="text-muted-foreground">/{billingPeriod === "monthly" ? "month" : "year"}</span>
                  </div>
                  <ul className="space-y-2">
                    {PLANS.premium.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase("subscription", "premium")}
                    disabled={isLoading !== null || currentPlan === "premium"}
                  >
                    {isLoading === "premium" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {currentPlan === "premium" ? "Current Plan" : "Upgrade to Premium"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Enterprise Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Enterprise</CardTitle>
                  <CardDescription>For teams and organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      ${billingPeriod === "monthly" ? PLANS.enterprise.monthly_price : PLANS.enterprise.yearly_price}
                    </span>
                    <span className="text-muted-foreground">/{billingPeriod === "monthly" ? "month" : "year"}</span>
                  </div>
                  <ul className="space-y-2">
                    {PLANS.enterprise.features.slice(0, 6).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handlePurchase("subscription", "enterprise")}
                    disabled={isLoading !== null || currentPlan === "enterprise"}
                  >
                    {isLoading === "enterprise" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {currentPlan === "enterprise" ? "Current Plan" : "Contact Sales"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="credits" className="mt-4">
            <p className="text-muted-foreground mb-4 text-center">
              Need just a few more tailored resumes? Buy credits that never expire.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <Card key={pkg.id} className={pkg.popular ? "border-primary relative" : ""}>
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">Best Value</Badge>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500" />
                      {pkg.credits} Credits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${pkg.price}</div>
                    <p className="text-sm text-muted-foreground">${(pkg.price / pkg.credits).toFixed(2)} per tailor</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={pkg.popular ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handlePurchase("credits", pkg.id)}
                      disabled={isLoading !== null}
                    >
                      {isLoading === pkg.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Buy Credits
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
