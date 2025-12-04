/**
 * Tailor Type Definitions
 * Types for the AI tailoring module
 */

import type { Resume, TailoredResumeOutput } from "./resume"
import type { Job } from "./job"

export type TailoringStyle = "concise" | "detailed"

export interface TailorRequest {
  resume: Resume
  job: Job
  style: TailoringStyle
}

export interface BulletSimilarityMatch {
  responsibility: string
  bullet_id: string
  bullet_text: string
  similarity: number // 0-1 cosine similarity
  section?: string
  company?: string
}

export interface TailorResponseData extends TailoredResumeOutput {
  remaining_quota?: number
  similar_bullets?: BulletSimilarityMatch[]
}

export interface TailorResponse {
  success: boolean
  data?: TailorResponseData
  error?: string
}

export interface ATSScore {
  overall_score: number // 0-100
  keyword_match: number
  formatting_score: number
  readability_score: number
  suggestions: string[]
  industry_benchmark?: {
    industry: string
    average: number
    top: number
    percentile: number
    delta_from_average: number
  }
}
