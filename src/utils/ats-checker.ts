/**
 * ATS (Applicant Tracking System) Checker
 * Analyzes resume for ATS compatibility
 */

import type { Resume } from "@/src/types/resume"
import type { Job } from "@/src/types/job"
import type { ATSScore } from "@/src/types/tailor"

interface IndustryBenchmark {
  industry: string
  keywords: string[]
  average: number
  top: number
}

const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  {
    industry: "Software & Product",
    keywords: ["javascript", "typescript", "react", "node", "api", "product", "frontend", "full stack"],
    average: 72,
    top: 90,
  },
  {
    industry: "Data & AI",
    keywords: ["data", "machine learning", "ml", "ai", "python", "model", "analytics", "sql"],
    average: 68,
    top: 88,
  },
  {
    industry: "Operations & Business",
    keywords: ["operations", "logistics", "marketing", "finance", "customer", "sales", "strategy"],
    average: 65,
    top: 85,
  },
]

function detectIndustryBenchmark(job: Job): IndustryBenchmark | null {
  const text = [
    job.title,
    job.seniority,
    ...(job.keywords || []),
    ...(job.responsibilities || []),
    ...(job.required_skills || []),
  ]
    .join(" ")
    .toLowerCase()

  let bestMatch: { benchmark: IndustryBenchmark; score: number } | null = null

  for (const benchmark of INDUSTRY_BENCHMARKS) {
    const score = benchmark.keywords.reduce((count, keyword) => (text.includes(keyword) ? count + 1 : count), 0)
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { benchmark, score }
    }
  }

  return bestMatch?.score ? bestMatch.benchmark : null
}

function calculatePercentile(score: number, benchmark: IndustryBenchmark): number {
  const clampedScore = Math.max(0, Math.min(100, score))
  if (clampedScore <= benchmark.average) {
    const fraction = benchmark.average === 0 ? 0 : clampedScore / benchmark.average
    return Math.max(1, Math.round(fraction * 50))
  }

  const range = benchmark.top - benchmark.average || 1
  const aboveAverage = clampedScore - benchmark.average
  return Math.min(99, Math.round(50 + (aboveAverage / range) * 50))
}

/**
 * Calculate keyword match percentage
 */
function calculateKeywordMatch(resume: Resume, job: Job): number {
  const resumeText = [
    resume.summary || "",
    ...resume.skills,
    ...resume.bullets.map((b) => b.tailored_text || b.raw_text),
  ]
    .join(" ")
    .toLowerCase()

  const matchedKeywords = job.keywords.filter((keyword) => resumeText.includes(keyword.toLowerCase()))

  return job.keywords.length > 0 ? matchedKeywords.length / job.keywords.length : 0
}

/**
 * Check formatting compatibility
 */
function calculateFormattingScore(resume: Resume): number {
  let score = 100

  // Check for required fields
  if (!resume.name) score -= 20
  if (!resume.email) score -= 20
  if (!resume.summary) score -= 10
  if (resume.sections.length === 0) score -= 15
  if (resume.skills.length === 0) score -= 15
  if (resume.bullets.length === 0) score -= 20

  // Check bullet quality
  const bulletsWithMetrics = resume.bullets.filter((b) => b.metric_value !== undefined || b.suggested_metric)
  if (bulletsWithMetrics.length < resume.bullets.length * 0.5) {
    score -= 10 // Less than 50% bullets have metrics
  }

  return Math.max(0, score)
}

/**
 * Calculate readability score
 */
function calculateReadabilityScore(resume: Resume): number {
  let score = 100

  // Check bullet length (penalize very long bullets)
  const longBullets = resume.bullets.filter((b) => (b.tailored_text || b.raw_text).length > 200)
  score -= longBullets.length * 5

  // Check for action verbs
  const actionVerbs = [
    "led",
    "developed",
    "created",
    "managed",
    "implemented",
    "designed",
    "built",
    "improved",
    "increased",
    "reduced",
    "achieved",
  ]
  const bulletsWithActions = resume.bullets.filter((b) => {
    const text = (b.tailored_text || b.raw_text).toLowerCase()
    return actionVerbs.some((verb) => text.includes(verb))
  })

  if (bulletsWithActions.length < resume.bullets.length * 0.7) {
    score -= 15
  }

  return Math.max(0, score)
}

/**
 * Generate improvement suggestions
 */
function generateSuggestions(resume: Resume, job: Job, benchmark?: IndustryBenchmark | null, overallScore?: number): string[] {
  const suggestions: string[] = []

  // Check for missing keywords
  const resumeText = [
    resume.summary || "",
    ...resume.skills,
    ...resume.bullets.map((b) => b.tailored_text || b.raw_text),
  ]
    .join(" ")
    .toLowerCase()

  const missingKeywords = job.keywords.filter((keyword) => !resumeText.includes(keyword.toLowerCase()))

  if (missingKeywords.length > 0) {
    suggestions.push(`Add missing keywords: ${missingKeywords.slice(0, 5).join(", ")}`)
  }

  if (!resume.summary) {
    suggestions.push("Add a professional summary section")
  }

  if (resume.skills.length < 5) {
    suggestions.push("Include more relevant skills (aim for 8-12)")
  }

  const bulletsWithoutMetrics = resume.bullets.filter((b) => b.metric_value === undefined && !b.suggested_metric)
  if (bulletsWithoutMetrics.length > 0) {
    suggestions.push(`Add quantifiable metrics to ${bulletsWithoutMetrics.length} bullet points`)
  }

  if (benchmark && typeof overallScore === "number" && overallScore < benchmark.average) {
    const delta = Math.abs(Math.round(overallScore - benchmark.average))
    suggestions.push(
      `Your ATS score is ${delta} points below the typical ${benchmark.industry} resume. Emphasize in-demand keywords and measurable outcomes to close the gap.`,
    )
  }

  return suggestions
}

/**
 * Main ATS scoring function
 */
export function checkATSCompatibility(resume: Resume, job: Job): ATSScore {
  const keywordMatch = calculateKeywordMatch(resume, job)
  const formattingScore = calculateFormattingScore(resume)
  const readabilityScore = calculateReadabilityScore(resume)

  const overallScore = Math.round(keywordMatch * 100 * 0.4 + formattingScore * 0.3 + readabilityScore * 0.3)

  const benchmark = detectIndustryBenchmark(job)
  const industryBenchmark = benchmark
    ? {
        industry: benchmark.industry,
        average: benchmark.average,
        top: benchmark.top,
        percentile: calculatePercentile(overallScore, benchmark),
        delta_from_average: Number((overallScore - benchmark.average).toFixed(1)),
      }
    : undefined

  return {
    overall_score: Math.min(100, Math.max(0, overallScore)),
    keyword_match: Math.round(keywordMatch * 100),
    formatting_score: formattingScore,
    readability_score: readabilityScore,
    suggestions: generateSuggestions(resume, job, benchmark, overallScore),
    industry_benchmark: industryBenchmark,
  }
}

/**
 * Get missing skills from job that aren't in resume
 */
export function getMissingSkills(resume: Resume, job: Job): string[] {
  const resumeSkillsLower = resume.skills.map((s) => s.toLowerCase())
  const resumeText = [resume.summary || "", ...resume.bullets.map((b) => b.tailored_text || b.raw_text)]
    .join(" ")
    .toLowerCase()

  return job.keywords.filter((keyword) => {
    const keywordLower = keyword.toLowerCase()
    return !resumeSkillsLower.includes(keywordLower) && !resumeText.includes(keywordLower)
  })
}
