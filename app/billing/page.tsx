"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Zap, Crown, Calendar, TrendingUp } from "lucide-react"

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  )
}

function BillingContent() {
  const { user, billing } = useAuth()

  if (!user || !billing) return null

  const quotaUsedPercent = billing.monthly_quota === -1 ? 0 : (billing.monthly_used / billing.monthly_quota) * 100

  const resetDate = new Date(billing.quota_reset_date)
  const daysUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

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
              <h1 className="text-2xl font-bold">Billing & Usage</h1>
              <p className="text-muted-foreground">Manage your subscription and credits</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <CardTitle>Current Plan</CardTitle>
                </div>
                <Badge variant={user.plan === "premium" ? "default" : "outline"}>{billing.plan_name}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold">
                  {user.plan === "free" ? "$0" : user.plan === "premium" ? "$9.99" : "$49.99"}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
              </div>

              {billing.subscription_expiry && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {billing.subscription_status === "active" ? "Renews" : "Expires"}{" "}
                    {new Date(billing.subscription_expiry).toLocaleDateString()}
                  </span>
                </div>
              )}

              <Separator />

              <ul className="space-y-2 text-sm">
                {billing.features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="w-full" asChild>
                <Link href="/pricing">{user.plan === "free" ? "Upgrade Plan" : "Manage Plan"}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Usage This Month</CardTitle>
              </div>
              <CardDescription>
                Resets in {daysUntilReset} day{daysUntilReset !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {billing.monthly_quota === -1 ? (
                <div className="text-center py-4">
                  <p className="text-3xl font-bold">{billing.monthly_used}</p>
                  <p className="text-muted-foreground">Resumes tailored (Unlimited)</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Monthly Quota</span>
                    <span className="font-medium">
                      {billing.monthly_used} / {billing.monthly_quota}
                    </span>
                  </div>
                  <Progress value={quotaUsedPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {billing.monthly_quota - billing.monthly_used} tailors remaining this month
                  </p>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Bonus Credits</span>
                </div>
                <span className="font-bold">{billing.credits_remaining}</span>
              </div>
            </CardContent>
          </Card>

          {/* Credit Packages */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <CardTitle>Buy More Credits</CardTitle>
              </div>
              <CardDescription>Credits never expire and can be used anytime</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { credits: 5, price: 4.99 },
                  { credits: 15, price: 9.99, popular: true },
                  { credits: 50, price: 24.99 },
                ].map((pkg) => (
                  <Card
                    key={pkg.credits}
                    className={`relative cursor-pointer hover:border-primary transition-colors ${
                      pkg.popular ? "border-primary" : ""
                    }`}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">Best Value</Badge>
                    )}
                    <CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold">{pkg.credits}</p>
                      <p className="text-sm text-muted-foreground mb-3">credits</p>
                      <p className="text-lg font-semibold">${pkg.price}</p>
                      <Button size="sm" variant={pkg.popular ? "default" : "outline"} className="mt-3 w-full">
                        Buy
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Payment Method</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {user.plan === "free" ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No payment method on file</p>
                  <p className="text-sm">Add a payment method when you upgrade</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-16 rounded bg-muted flex items-center justify-center text-xs font-mono">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium">**** **** **** 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
