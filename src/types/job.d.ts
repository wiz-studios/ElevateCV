/**
 * Job Type Definitions
 * Core data structures for job description parsing
 */

export interface Job {
  id?: string
  title: string
  seniority?: string
  keywords: string[]
  responsibilities: string[]
  company?: string
  location?: string
  required_skills?: string[]
  preferred_skills?: string[]
}

export interface ParseJobRequest {
  raw_text: string
}

export interface ParseJobResponse {
  success: boolean
  data?: Job
  error?: string
}
