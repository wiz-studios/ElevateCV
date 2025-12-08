"use client"

"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

import clsx from "clsx"
import { useState } from "react"
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Wand2 
} from "lucide-react"

import type { ImprovementResponse, ImprovementSuggestion } from "@/src/services/ai"

interface ImprovementSuggestionsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ImprovementResponse | null
  isLoading: boolean
  onApply?: (suggestions: ImprovementSuggestion[]) => Promise<void>

  // Optionally, allow single suggestion apply
  onApplySingle?: (suggestion: ImprovementSuggestion) => Promise<void>
}

export function ImprovementSuggestions({
  open,
  onOpenChange,
  data,
  isLoading,
  onApply,
}: ImprovementSuggestionsProps) {
  if (!data && !isLoading) return null

  const [isApplying, setIsApplying] = useState(false)
  const [applyingId, setApplyingId] = useState<string | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      case "Low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Keywords":
        return <CheckCircle className="h-4 w-4" />
      case "Impact":
        return <ArrowRight className="h-4 w-4" />
      case "Formatting":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const handleApply = async () => {
    if (!data) return
    setIsApplying(true)
    try {
      if (onApply) await onApply(data.suggestions)
    } catch (err) {
      console.error("Failed to apply improvements:", err)
    } finally {
      setIsApplying(false)
    }
  }

  // Handler for single suggestion apply
  const handleApplySingle = async (suggestion: ImprovementSuggestion) => {
    if (!onApply) return;
    setApplyingId(suggestion.id);
    try {
      await onApply([suggestion]);
    } catch (err) {
      console.error("Failed to apply single improvement:", err);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col min-h-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            AI Improvement Suggestions
          </DialogTitle>
          <DialogDescription>
            Actionable enhancements tailored to maximize ATS performance and clarity.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable suggestions */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Analyzing your resume...</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0 overflow-y-auto pr-2 pb-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                  <p className="text-3xl font-bold">{data?.overall_score}/100</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Suggestions</p>
                  <p className="text-3xl font-bold">{data?.suggestions.length}</p>
                </div>
              </div>

              {data?.suggestions.map((s) => (
                <div key={s.id} className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getCategoryIcon(s.category)}
                      {s.category}
                    </Badge>
                    <Badge variant={getPriorityColor(s.priority) as any}>
                      {s.priority} Priority
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-base">{s.suggestion}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.reasoning}</p>
                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={applyingId === s.id || isApplying}
                      onClick={() => handleApplySingle(s)}
                    >
                      {applyingId === s.id ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></span>
                          Applying...
                        </span>
                      ) : (
                        <>Apply Fix</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-black/5 dark:border-white/5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleApply} className="gradient-accent text-white">
            {isApplying ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Applying Fixes...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" /> Auto-Fix Resume
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
