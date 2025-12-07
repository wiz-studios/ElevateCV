"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Palette, Lock, Crown } from "lucide-react"
import { TEMPLATE_CONFIGS, type ResumeTemplate } from "@/src/types/template"
import { Badge } from "@/components/ui/badge"

interface TemplateSelectorProps {
  selectedTemplate: ResumeTemplate
  onTemplateChange: (template: ResumeTemplate) => void
}

export function TemplateSelector({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) {
  const { user } = useAuth()
  const isFreePlan = !user || user.plan === "free"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Resume Template
        </CardTitle>
        <CardDescription>Choose a template style for your resume export</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedTemplate} onValueChange={(v) => onTemplateChange(v as ResumeTemplate)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TEMPLATE_CONFIGS).map((config) => {
                const isLocked = config.isPremium && isFreePlan
                return (
                  <SelectItem key={config.id} value={config.id} disabled={isLocked}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-2">
                          {config.name}
                          {config.isPremium && <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-100">Premium</Badge>}
                        </span>
                        <span className="text-xs text-muted-foreground">{config.description}</span>
                      </div>
                      {isLocked && <Lock className="h-3 w-3 text-muted-foreground opacity-50" />}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md relative overflow-hidden">
            <div className="font-medium mb-1 flex items-center gap-2">
              {TEMPLATE_CONFIGS[selectedTemplate].name}
              {TEMPLATE_CONFIGS[selectedTemplate].isPremium && <Crown className="h-3 w-3 text-amber-500" />}
            </div>
            <div className="text-xs">{TEMPLATE_CONFIGS[selectedTemplate].description}</div>

            {TEMPLATE_CONFIGS[selectedTemplate].isPremium && (
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Crown className="h-12 w-12" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

