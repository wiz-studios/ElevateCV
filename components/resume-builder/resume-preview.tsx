"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Star } from "lucide-react"
import type { Resume } from "@/src/types/resume"

interface ResumePreviewProps {
  resume: Resume
  matchScore?: number
  missingSkills?: string[]
}

export function ResumePreview({ resume, matchScore, missingSkills }: ResumePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{resume.name}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {resume.email}
              </span>
              {resume.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {resume.phone}
                </span>
              )}
            </div>
          </div>
          {matchScore !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{Math.round(matchScore * 100)}%</span>
              <span className="text-xs text-muted-foreground">match</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {resume.summary && (
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">Summary</h3>
            <p className="text-sm italic">{resume.summary}</p>
          </div>
        )}

        {resume.skills.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1">
              {resume.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {missingSkills && missingSkills.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-destructive mb-2">Missing Skills</h3>
            <div className="flex flex-wrap gap-1">
              {missingSkills.map((skill, idx) => (
                <Badge key={idx} variant="outline" className="text-xs border-destructive text-destructive">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {resume.bullets.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">Experience</h3>
            <div className="space-y-4">
              {Object.entries(
                resume.bullets.reduce(
                  (acc, bullet) => {
                    const key = bullet.company || bullet.section
                    if (!acc[key]) acc[key] = []
                    acc[key].push(bullet)
                    return acc
                  },
                  {} as Record<string, typeof resume.bullets>,
                ),
              ).map(([company, bullets]) => (
                <div key={company}>
                  <h4 className="font-medium text-sm mb-2">{company}</h4>
                  <ul className="space-y-1.5">
                    {bullets.map((bullet) => (
                      <li
                        key={bullet.id}
                        className="text-sm pl-4 relative before:content-['•'] before:absolute before:left-0"
                      >
                        {bullet.tailored_text || bullet.raw_text}
                        {bullet.suggested_metric && (
                          <span className="block text-xs text-muted-foreground italic mt-0.5">
                            Suggestion: {bullet.suggested_metric}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
