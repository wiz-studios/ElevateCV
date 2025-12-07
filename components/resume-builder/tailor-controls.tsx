"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Wand2, Download, Loader2, FileText, AlertCircle, Lock, Lightbulb } from "lucide-react"
import { UsageDisplay } from "@/components/billing/usage-display"
import { UpgradeModal } from "@/components/billing/upgrade-modal"
import { QuotaExceededBanner } from "@/components/billing/quota-exceeded-banner"
import { ImprovementSuggestions } from "./improvement-suggestions"
import type { Resume } from "@/src/types/resume"
import type { Job } from "@/src/types/job"
import type { TailoringStyle, TailorResponseData } from "@/src/types/tailor"
import type { ResumeTemplate } from "@/src/types/template"
import type { ImprovementResponse } from "@/src/services/ai"

interface TailorControlsProps {
  resume: Resume | null
  job: Job | null
  onTailored: (result: TailorResponseData) => void
  template: ResumeTemplate
}

export function TailorControls({ resume, job, onTailored, template }: TailorControlsProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [style, setStyle] = useState<TailoringStyle>("concise")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [quotaError, setQuotaError] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // New state for improvements
  const [showImprovements, setShowImprovements] = useState(false)
  const [improvementData, setImprovementData] = useState<ImprovementResponse | null>(null)
  const [isImproving, setIsImproving] = useState(false)

  const canTailor = resume && job

  const handleTailor = async () => {
    if (!canTailor) return

    setIsLoading(true)
    setError(null)
    setQuotaExceeded(false)
    setQuotaError(null)

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, job, style }),
      })

      const result = await response.json()

      console.log("[TailorControls] API Response:", {
        status: response.status,
        success: result.success,
        hasData: !!result.data,
        error: result.error,
      })

      if (response.status === 402) {
        setQuotaExceeded(true)
        setQuotaError(result.error || "Quota exceeded")
        setShowUpgradeModal(true)
        return
      }

      if (result.success && result.data) {
        console.log("[TailorControls] Calling onTailored with data")
        onTailored(result.data)
      } else {
        console.error("[TailorControls] Invalid response:", result)
        setError(result.error || "Failed to tailor resume")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestImprovements = async () => {
    if (!resume || !job) return

    setShowImprovements(true)
    if (improvementData) return // Don't re-fetch if we have data

    setIsImproving(true)
    try {
      const response = await fetch("/api/suggest-improvements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, job }),
      })
      const result = await response.json()
      if (result.success) {
        setImprovementData(result.data)
      }
    } catch (err) {
      console.error("Failed to get improvements:", err)
    } finally {
      setIsImproving(false)
    }
  }

  const handleExportPDF = async () => {
    if (!resume) return

    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, format: "html", template }),
      })

      const result = await response.json()

      if (result.success) {
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(result.data.html)
          printWindow.document.close()
          setTimeout(() => printWindow.print(), 250)
        }
      }
    } catch (err) {
      console.error("Export failed:", err)
    }
  }

  const handleExportText = async () => {
    if (!resume) return

    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, format: "text" }),
      })

      const text = await response.text()
      const blob = new Blob([text], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${resume.name.replace(/\s+/g, "_")}_Resume.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export failed:", err)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Tailor Resume
          </CardTitle>
          <CardDescription>Customize your resume to match the job description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageDisplay onUpgradeClick={() => setShowUpgradeModal(true)} />

          {quotaExceeded && (
            <QuotaExceededBanner reason={quotaError || undefined} onUpgradeClick={() => setShowUpgradeModal(true)} />
          )}

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Style:</label>
            <Select value={style} onValueChange={(v) => setStyle(v as TailoringStyle)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!canTailor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Parse both resume and job description first
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button onClick={handleTailor} disabled={!canTailor || isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Tailoring...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Tailor Resume
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={handleSuggestImprovements}
              disabled={!canTailor || isLoading}
              className="w-full border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 text-primary"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Suggest Improvements
            </Button>
          </div>

          <div className="flex gap-2 pt-2 border-t mt-2">
            <Button variant="outline" onClick={handleExportPDF} disabled={!resume} className="flex-1 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportText} disabled={!resume} className="flex-1 bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              Export TXT
            </Button>
          </div>
        </CardContent>
      </Card>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} quotaExceeded={quotaExceeded} />

      <ImprovementSuggestions
        open={showImprovements}
        onOpenChange={setShowImprovements}
        data={improvementData}
        isLoading={isImproving}
      />
    </>
  )
}
