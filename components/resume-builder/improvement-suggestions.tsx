"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lightbulb, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react"
import type { ImprovementResponse, ImprovementSuggestion } from "@/src/services/ai"

interface ImprovementSuggestionsProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: ImprovementResponse | null
    isLoading: boolean
}

export function ImprovementSuggestions({ open, onOpenChange, data, isLoading }: ImprovementSuggestionsProps) {
    if (!data && !isLoading) return null

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "High": return "destructive"
            case "Medium": return "default" // primary
            case "Low": return "secondary"
            default: return "outline"
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Keywords": return <CheckCircle className="h-4 w-4" />
            case "Impact": return <ArrowRight className="h-4 w-4" />
            case "Formatting": return <AlertTriangle className="h-4 w-4" />
            default: return <Lightbulb className="h-4 w-4" />
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        AI Improvement Suggestions
                    </DialogTitle>
                    <DialogDescription>
                        Actionable tips to increase your resume's impact and ATS score.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Analyzing your resume...</p>
                    </div>
                ) : data ? (
                    <div className="flex flex-col gap-6 overflow-hidden">
                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                                <p className="text-3xl font-bold">{data.overall_score}/100</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-muted-foreground">Suggestions</p>
                                <p className="text-3xl font-bold">{data.suggestions.length}</p>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 pr-4 -mr-4">
                            <div className="space-y-4">
                                {data.suggestions.map((suggestion) => (
                                    <div key={suggestion.id} className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    {getCategoryIcon(suggestion.category)}
                                                    {suggestion.category}
                                                </Badge>
                                                <Badge variant={getPriorityColor(suggestion.priority) as any}>
                                                    {suggestion.priority} Priority
                                                </Badge>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-base mb-1">{suggestion.suggestion}</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {suggestion.reasoning}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
