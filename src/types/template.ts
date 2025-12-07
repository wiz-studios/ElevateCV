/**
 * Resume Template Type Definitions
 */

export type ResumeTemplate = "professional" | "modern" | "minimalist"

export interface TemplateConfig {
  id: ResumeTemplate
  name: string
  description: string
  preview?: string
  isPremium?: boolean
}

export const TEMPLATE_CONFIGS: Record<ResumeTemplate, TemplateConfig> = {
  professional: {
    id: "professional",
    name: "Professional",
    description: "Classic ATS-friendly format with clear sections and traditional styling",
    isPremium: false,
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with enhanced visual hierarchy and color accents",
    isPremium: true,
  },
  minimalist: {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean and simple layout focused on content with minimal formatting",
    isPremium: true,
  },
}

