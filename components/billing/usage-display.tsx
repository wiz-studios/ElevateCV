"use client"

import { useAuth } from "@/contexts/auth-context"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Crown, Loader2 } from "lucide-react"

interface UsageDisplayProps {
  onUpgradeClick?: () => void
  compact?: boolean
}

export function UsageDisplay({ onUpgradeClick, compact = false }: UsageDisplayProps) {
  const { billing, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (!billing) {
    return null
  }

  const isUnlimited = billing.monthly_quota === -1
  const usagePercent = isUnlimited ? 0 : (billing.monthly_used / billing.monthly_quota) * 100
  const remaining = isUnlimited ? "Unlimited" : billing.monthly_quota - billing.monthly_used

  if (compact) {
    return (
      <Badge
        variant={billing.plan === "premium" || billing.plan === "enterprise" ? "default" : "secondary"}
        className={billing.plan === "premium" || billing.plan === "enterprise" ? "bg-amber-500 hover:bg-amber-600" : ""}
      >
        {(billing.plan === "premium" || billing.plan === "enterprise") && <Crown className="h-3 w-3 mr-1" />}
        {billing.plan_name}
        {billing.credits_remaining > 0 && (
          <span className="ml-1.5 flex items-center">
            <Zap className="h-3 w-3 mx-1" />
            {billing.credits_remaining}
          </span>
        )}
      </Badge>
    )
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={billing.plan === "premium" ? "default" : "secondary"}
              className={billing.plan === "premium" ? "bg-amber-500 hover:bg-amber-600" : ""}
            >
              {billing.plan === "premium" && <Crown className="h-3 w-3 mr-1" />}
              {billing.plan_name} Plan
            </Badge>
            {billing.credits_remaining > 0 && (
              <Badge variant="outline">
                <Zap className="h-3 w-3 mr-1" />
                {billing.credits_remaining} extra credits
              </Badge>
            )}
          </div>
          {onUpgradeClick && billing.plan === "free" && (
            <button onClick={onUpgradeClick} className="text-sm text-primary hover:underline font-medium">
              Upgrade
            </button>
          )}
        </div>

        {!isUnlimited ? (
          <>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Monthly Usage</span>
              <span className="font-medium">
                {billing.monthly_used} / {billing.monthly_quota} tailored resumes
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Resets on{" "}
              {billing.quota_reset_date
                ? new Date(billing.quota_reset_date).toLocaleDateString()
                : "next month"}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Unlimited AI-tailored resumes with your {billing.plan_name} plan
          </p>
        )}
      </CardContent>
    </Card>
  )
}
