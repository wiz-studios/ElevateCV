"use client"

import { AlertTriangle, Zap } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface QuotaExceededBannerProps {
  onUpgradeClick: () => void
  reason?: string
}

export function QuotaExceededBanner({ onUpgradeClick, reason }: QuotaExceededBannerProps) {
  return (
    <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">Quota Exceeded</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span className="text-amber-700 dark:text-amber-300">
          {reason || "You've used all your free AI tailors this month."}
        </span>
        <Button size="sm" onClick={onUpgradeClick} className="ml-4 bg-amber-600 hover:bg-amber-700">
          <Zap className="h-4 w-4 mr-1" />
          Upgrade Now
        </Button>
      </AlertDescription>
    </Alert>
  )
}
