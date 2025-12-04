"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Palette } from "lucide-react"
import { TEMPLATE_CONFIGS, type ResumeTemplate } from "@/src/types/template"

interface TemplateSelectorProps {
  selectedTemplate: ResumeTemplate
  onTemplateChange: (template: ResumeTemplate) => void
}

export function TemplateSelector({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) {
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
              {Object.values(TEMPLATE_CONFIGS).map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{config.name}</span>
                    <span className="text-xs text-muted-foreground">{config.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
            <div className="font-medium mb-1">{TEMPLATE_CONFIGS[selectedTemplate].name}</div>
            <div className="text-xs">{TEMPLATE_CONFIGS[selectedTemplate].description}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

