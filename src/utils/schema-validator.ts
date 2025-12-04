/**
 * JSON Schema Validator
 * Enforces structured output from AI responses
 */

import type { Resume, ResumeBullet } from "@/src/types/resume"
import type { Job } from "@/src/types/job"

export function validateResumeBullet(bullet: unknown): bullet is ResumeBullet {
  if (typeof bullet !== "object" || bullet === null) return false
  const b = bullet as Record<string, unknown>

  return (
    typeof b.id === "string" &&
    typeof b.section === "string" &&
    typeof b.raw_text === "string" &&
    (b.company === undefined || typeof b.company === "string") &&
    (b.start_date === undefined || typeof b.start_date === "string") &&
    (b.end_date === undefined || typeof b.end_date === "string") &&
    (b.action === undefined || typeof b.action === "string") &&
    (b.impact === undefined || typeof b.impact === "string") &&
    (b.metric_value === undefined || typeof b.metric_value === "number") &&
    (b.metric_unit === undefined || typeof b.metric_unit === "string") &&
    (b.tailored_text === undefined || typeof b.tailored_text === "string") &&
    (b.suggested_metric === undefined || typeof b.suggested_metric === "string")
  )
}

export function validateResume(resume: unknown): resume is Resume {
  if (typeof resume !== "object" || resume === null) return false
  const r = resume as Record<string, unknown>

  return (
    typeof r.name === "string" &&
    typeof r.email === "string" &&
    (r.phone === undefined || typeof r.phone === "string") &&
    (r.summary === undefined || typeof r.summary === "string") &&
    Array.isArray(r.sections) &&
    r.sections.every((s: unknown) => typeof s === "string") &&
    Array.isArray(r.skills) &&
    r.skills.every((s: unknown) => typeof s === "string") &&
    Array.isArray(r.bullets) &&
    r.bullets.every(validateResumeBullet)
  )
}

export function validateJob(job: unknown): job is Job {
  if (typeof job !== "object" || job === null) return false
  const j = job as Record<string, unknown>

  return (
    typeof j.title === "string" &&
    (j.seniority === undefined || typeof j.seniority === "string") &&
    Array.isArray(j.keywords) &&
    j.keywords.every((k: unknown) => typeof k === "string") &&
    Array.isArray(j.responsibilities) &&
    j.responsibilities.every((r: unknown) => typeof r === "string")
  )
}

/**
 * Sanitize and enforce Resume JSON structure
 * Fills in defaults for missing optional fields
 */
export function sanitizeResume(input: Partial<Resume>): Resume {
  return {
    name: input.name || "Unknown",
    email: input.email || "unknown@email.com",
    phone: input.phone,
    summary: input.summary,
    sections: input.sections || [],
    skills: input.skills || [],
    bullets: (input.bullets || []).map((b, idx) => ({
      id: b.id || `bullet-${idx}`,
      section: b.section || "Experience",
      company: b.company,
      start_date: b.start_date,
      end_date: b.end_date,
      raw_text: b.raw_text || "",
      action: b.action,
      impact: b.impact,
      metric_value: b.metric_value,
      metric_unit: b.metric_unit,
      tailored_text: b.tailored_text,
      suggested_metric: b.suggested_metric,
    })),
  }
}

/**
 * Sanitize and enforce Job JSON structure
 */
export function sanitizeJob(input: Partial<Job>): Job {
  return {
    title: input.title || "Unknown Position",
    seniority: input.seniority,
    keywords: input.keywords || [],
    responsibilities: input.responsibilities || [],
    company: input.company,
    location: input.location,
    required_skills: input.required_skills,
    preferred_skills: input.preferred_skills,
  }
}
