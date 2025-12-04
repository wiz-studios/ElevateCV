/**
 * Resume Type Definitions
 * Core data structures for the AI Resume Builder
 */

export interface ResumeBullet {
  id: string
  section: string
  company?: string
  start_date?: string
  end_date?: string
  raw_text: string
  action?: string
  impact?: string
  metric_value?: number
  metric_unit?: string
  tailored_text?: string
  suggested_metric?: string // When metric is missing, AI suggests one
}

export interface Resume {
  name: string
  email: string
  phone?: string
  summary?: string
  sections: string[]
  skills: string[]
  bullets: ResumeBullet[]
}

export interface TailoredResumeOutput {
  resume: Resume
  match_score: number // 0-1 score indicating job match
  missing_skills: string[] // Skills from job not found in resume
}

export interface ParseResumeRequest {
  raw_text: string
}

export interface ParseResumeResponse {
  success: boolean
  data?: Resume
  error?: string
}
