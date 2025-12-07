"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Lock, CheckCircle, AlertTriangle, XCircle, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
  const { user } = useAuth()
  const isFreePlan = !user || user.plan === "free"

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

        <div className="relative">
          <div className={isFreePlan ? "blur-sm select-none opacity-50 transition-all duration-300" : ""}>
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
              <div className="pt-2 border-t mt-4">
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
              <div className="pt-2 border-t text-sm mt-2">
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
          </div>

          {isFreePlan && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border text-center max-w-[250px]">
                <Lock className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Unlock Insights</h4>
                <p className="text-xs text-muted-foreground mb-3">Upgrade to Premium to see detailed scoring breakdown and suggestions.</p>
                <Button size="sm" className="w-full gradient-accent text-white shadow-subtle hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
