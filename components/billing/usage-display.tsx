"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Crown, Loader2 } from "lucide-react"
import type { BillingUsage } from "@/src/types/billing"

interface UsageDisplayProps {
  onUpgradeClick?: () => void
  compact?: boolean
}

export function UsageDisplay({ onUpgradeClick, compact = false }: UsageDisplayProps) {
  const [usage, setUsage] = useState<BillingUsage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      try {
        const response = await fetch("/api/billing/usage")
        const result = await response.json()
        if (result.success) {
          setUsage(result.data)
        }
      } catch (err) {
        console.error("Failed to fetch usage:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsage()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (!usage) {
    return null
  }

  const isUnlimited = usage.monthly_quota === -1
  const usagePercent = isUnlimited ? 0 : (usage.monthly_used / usage.monthly_quota) * 100
  const remaining = isUnlimited ? "Unlimited" : usage.monthly_quota - usage.monthly_used

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant={usage.plan === "premium" ? "default" : "secondary"}
          className={usage.plan === "premium" ? "bg-amber-500 hover:bg-amber-600" : ""}
        >
          {usage.plan === "premium" && <Crown className="h-3 w-3 mr-1" />}
          {usage.plan_name}
        </Badge>
        {!isUnlimited && <span className="text-sm text-muted-foreground">{remaining} tailors left</span>}
        {usage.credits_remaining > 0 && (
          <Badge variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            {usage.credits_remaining} credits
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={usage.plan === "premium" ? "default" : "secondary"}
              className={usage.plan === "premium" ? "bg-amber-500 hover:bg-amber-600" : ""}
            >
              {usage.plan === "premium" && <Crown className="h-3 w-3 mr-1" />}
              {usage.plan_name} Plan
            </Badge>
            {usage.credits_remaining > 0 && (
              <Badge variant="outline">
                <Zap className="h-3 w-3 mr-1" />
                {usage.credits_remaining} extra credits
              </Badge>
            )}
          </div>
          {onUpgradeClick && usage.plan === "free" && (
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
                {usage.monthly_used} / {usage.monthly_quota} tailored resumes
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Resets on{" "}
              {usage.quota_reset_date
                ? new Date(usage.quota_reset_date).toLocaleDateString()
                : "next month"}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Unlimited AI-tailored resumes with your {usage.plan_name} plan
          </p>
        )}
      </CardContent>
    </Card>
  )
}
