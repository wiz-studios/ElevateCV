"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BulletSimilarityMatch } from "@/src/types/tailor"
import { Target, Sparkles } from "lucide-react"

interface SimilarityPanelProps {
  matches: BulletSimilarityMatch[]
}

export function SimilarityPanel({ matches }: SimilarityPanelProps) {
  if (!matches || matches.length === 0) {
    return null
  }

  const topMatches = matches.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Role Match Highlights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topMatches.map((match) => (
          <div key={match.bullet_id} className="space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{match.responsibility}</span>
              <span className="text-muted-foreground">{Math.round(match.similarity * 100)}% match</span>
            </div>
            <p className="text-sm text-muted-foreground">{match.bullet_text}</p>
            {(match.company || match.section) && (
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                <Sparkles className="mr-1 inline h-3 w-3 align-text-bottom" />
                {[match.company, match.section].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

