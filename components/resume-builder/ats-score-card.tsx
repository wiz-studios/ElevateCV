"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, XCircle, BarChart3 } from "lucide-react"
import type { ATSScore } from "@/src/types/tailor"

interface ATSScoreCardProps {
  score: ATSScore
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

function getScoreIcon(score: number) {
  if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />
  if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />
  return <XCircle className="h-5 w-5 text-red-600" />
}

export function ATSScoreCard({ score }: ATSScoreCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          ATS Compatibility Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-4xl font-bold">
            <span className={getScoreColor(score.overall_score)}>{score.overall_score}</span>
            <span className="text-lg text-muted-foreground">/100</span>
          </span>
          {getScoreIcon(score.overall_score)}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Keyword Match</span>
              <span>{score.keyword_match}%</span>
            </div>
            <Progress value={score.keyword_match} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Formatting</span>
              <span>{score.formatting_score}%</span>
            </div>
            <Progress value={score.formatting_score} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Readability</span>
              <span>{score.readability_score}%</span>
            </div>
            <Progress value={score.readability_score} className="h-2" />
          </div>
        </div>

        {score.suggestions.length > 0 && (
          <div className="pt-2 border-t">
            <h4 className="font-medium text-sm mb-2">Suggestions</h4>
            <ul className="space-y-1">
              {score.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {score.industry_benchmark && (
          <div className="pt-2 border-t text-sm">
            <div className="flex items-center justify-between">
              <span>Industry: {score.industry_benchmark.industry}</span>
              <span className="text-muted-foreground">{score.industry_benchmark.percentile} percentile</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Avg {score.industry_benchmark.average}/100 • Top {score.industry_benchmark.top}/100 (
              {score.industry_benchmark.delta_from_average >= 0 ? "+" : ""}
              {score.industry_benchmark.delta_from_average} vs avg)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
