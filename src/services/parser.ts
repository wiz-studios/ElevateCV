/**
 * Resume and Job Parser Service
 * Extracts structured data from raw text
 * Phase 1: Regex-based parsing
 * Phase 2+: AI-enhanced parsing can be plugged in
 */

import { generateObject } from "ai"
import { z } from "zod"
import type { Resume, ResumeBullet } from "@/src/types/resume"
import type { Job } from "@/src/types/job"
import { sanitizeResume, sanitizeJob } from "@/src/utils/schema-validator"

// Common section headers in resumes
const SECTION_PATTERNS = [
  /^(experience|work\s+experience|professional\s+experience|employment)/i,
  /^(education|academic|qualifications)/i,
  /^(skills|technical\s+skills|core\s+competencies)/i,
  /^(projects|personal\s+projects|side\s+projects)/i,
  /^(summary|professional\s+summary|profile|objective)/i,
  /^(certifications?|certificates?|licenses?)/i,
  /^(awards?|honors?|achievements?)/i,
]

// Email regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

// Phone regex (various formats)
const PHONE_REGEX = /(\+?1?[-.\s]?)?$$?[0-9]{3}$$?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/

// Date patterns
const DATE_REGEX =
  /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|(\d{1,2}\/\d{4})|present|current/gi

// Action verbs for bullet detection
const ACTION_VERBS = [
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
  "delivered",
  "launched",
  "established",
  "coordinated",
  "analyzed",
  "optimized",
  "spearheaded",
  "orchestrated",
  "streamlined",
  "executed",
  "pioneered",
]

const USE_AI_PARSING = process.env.USE_AI_PARSING === "true"
const RESUME_PARSER_MODEL = process.env.OPENAI_PARSER_MODEL || "openai/gpt-4o-mini"
const JOB_PARSER_MODEL = process.env.OPENAI_JOB_PARSER_MODEL || RESUME_PARSER_MODEL

const AiResumeSchema = z.object({
  name: z.string().min(1).default("Unknown"),
  email: z.string().min(3).default("unknown@email.com"),
  phone: z.string().optional(),
  summary: z.string().optional(),
  sections: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  bullets: z
    .array(
      z.object({
        id: z.string().optional(),
        section: z.string().default("Experience"),
        company: z.string().optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
        raw_text: z.string(),
        action: z.string().optional(),
        impact: z.string().optional(),
        metric_value: z.number().optional(),
        metric_unit: z.string().optional(),
      }),
    )
    .default([]),
})

const AiJobSchema = z.object({
  title: z.string().min(1).default("Unknown Position"),
  seniority: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  required_skills: z.array(z.string()).optional(),
  preferred_skills: z.array(z.string()).optional(),
})

const RESUME_PARSER_SYSTEM_PROMPT = `You are an expert resume parsing engine. Extract structured JSON containing the candidate's name, contact information, summary, sections, skills, and work bullets. Preserve original bullet wording and never invent details.`
const JOB_PARSER_SYSTEM_PROMPT = `You are an expert ATS analyst. Convert the job description into structured JSON identifying the role title, seniority, keywords, and key responsibilities.`

/**
 * Extract name from resume text
 * Assumes name is typically at the top
 */
function extractName(text: string): string {
  const lines = text.split("\n").filter((line) => line.trim())

  // First non-empty line is often the name
  for (const line of lines.slice(0, 3)) {
    const cleaned = line.trim()
    // Skip if it looks like an email or phone
    if (EMAIL_REGEX.test(cleaned) || PHONE_REGEX.test(cleaned)) continue
    // Skip if too long (probably not a name)
    if (cleaned.length > 50) continue
    // Skip if it's a section header
    if (SECTION_PATTERNS.some((p) => p.test(cleaned))) continue

    return cleaned
  }

  return "Unknown"
}

/**
 * Extract email from text
 */
function extractEmail(text: string): string {
  const match = text.match(EMAIL_REGEX)
  return match ? match[0] : "unknown@email.com"
}

/**
 * Extract phone from text
 */
function extractPhone(text: string): string | undefined {
  const match = text.match(PHONE_REGEX)
  return match ? match[0] : undefined
}

/**
 * Identify sections in resume
 */
function extractSections(text: string): string[] {
  const sections: string[] = []
  const lines = text.split("\n")

  for (const line of lines) {
    for (const pattern of SECTION_PATTERNS) {
      if (pattern.test(line.trim())) {
        const sectionName = line
          .trim()
          .replace(/[:\-–—]/g, "")
          .trim()
        if (!sections.includes(sectionName)) {
          sections.push(sectionName)
        }
        break
      }
    }
  }

  return sections
}

/**
 * Extract skills from text
 * Looks for skills section and common tech keywords
 */
function extractSkills(text: string): string[] {
  const skills: string[] = []
  const lines = text.split("\n")
  let inSkillsSection = false

  // Common technical skills to detect
  const techKeywords = [
    "javascript",
    "typescript",
    "python",
    "java",
    "react",
    "node.js",
    "nodejs",
    "aws",
    "docker",
    "kubernetes",
    "sql",
    "postgresql",
    "mongodb",
    "git",
    "html",
    "css",
    "tailwind",
    "next.js",
    "nextjs",
    "vue",
    "angular",
    "machine learning",
    "ai",
    "data science",
    "agile",
    "scrum",
    "ci/cd",
  ]

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase()

    // Check if entering skills section
    if (/^(skills|technical\s+skills|core\s+competencies)/i.test(trimmed)) {
      inSkillsSection = true
      continue
    }

    // Check if leaving skills section
    if (inSkillsSection && SECTION_PATTERNS.some((p) => p.test(trimmed))) {
      inSkillsSection = false
    }

    if (inSkillsSection && trimmed.length > 0) {
      // Split by common delimiters
      const potentialSkills = trimmed.split(/[,•|·\-–—]/)
      for (const skill of potentialSkills) {
        const cleaned = skill.trim()
        if (cleaned.length > 1 && cleaned.length < 50) {
          skills.push(cleaned)
        }
      }
    }

    // Also detect tech keywords anywhere in document
    for (const keyword of techKeywords) {
      if (trimmed.includes(keyword) && !skills.includes(keyword)) {
        skills.push(keyword)
      }
    }
  }

  return [...new Set(skills)] // Remove duplicates
}

/**
 * Extract bullet points from experience/project sections
 */
function extractBullets(text: string): ResumeBullet[] {
  const bullets: ResumeBullet[] = []
  const lines = text.split("\n")
  let currentSection = "Experience"
  let currentCompany: string | undefined
  let bulletId = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Update current section
    for (const pattern of SECTION_PATTERNS) {
      if (pattern.test(line)) {
        currentSection = line.replace(/[:\-–—]/g, "").trim()
        break
      }
    }

    // Detect company names (often followed by dates)
    if (DATE_REGEX.test(line) && !line.startsWith("•") && !line.startsWith("-")) {
      // This might be a company/role line
      const dates = line.match(DATE_REGEX)
      if (dates && dates.length >= 1) {
        currentCompany = line
          .replace(DATE_REGEX, "")
          .replace(/[|,\-–—]/g, " ")
          .trim()
      }
    }

    // Detect bullet points
    if (
      line.startsWith("•") ||
      line.startsWith("-") ||
      line.startsWith("*") ||
      ACTION_VERBS.some((verb) => line.toLowerCase().startsWith(verb))
    ) {
      const rawText = line.replace(/^[•\-*]\s*/, "").trim()

      if (rawText.length > 10) {
        // Extract metrics if present
        const metricMatch = rawText.match(
          /(\d+(?:\.\d+)?)\s*(%|users?|customers?|million|k|team\s+members?|people|projects?|dollars?|\$)/i,
        )

        // Detect action verb
        const firstWord = rawText.split(" ")[0].toLowerCase()
        const action = ACTION_VERBS.includes(firstWord) ? firstWord : undefined

        bullets.push({
          id: `bullet-${bulletId++}`,
          section: currentSection,
          company: currentCompany,
          raw_text: rawText,
          action,
          metric_value: metricMatch ? Number.parseFloat(metricMatch[1]) : undefined,
          metric_unit: metricMatch ? metricMatch[2] : undefined,
        })
      }
    }
  }

  return bullets
}

/**
 * Extract summary/objective
 */
function extractSummary(text: string): string | undefined {
  const lines = text.split("\n")
  let inSummarySection = false
  const summaryLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (/^(summary|professional\s+summary|profile|objective)/i.test(trimmed)) {
      inSummarySection = true
      continue
    }

    if (
      inSummarySection &&
      SECTION_PATTERNS.some((p) => p.test(trimmed) && !/summary|profile|objective/i.test(trimmed))
    ) {
      break
    }

    if (inSummarySection && trimmed.length > 0) {
      summaryLines.push(trimmed)
    }
  }

  return summaryLines.length > 0 ? summaryLines.join(" ") : undefined
}

/**
 * Main resume parser function (heuristics)
 * Phase 1: Regex-based extraction
 */
function parseResumeHeuristics(rawText: string): Resume {
  const resume: Partial<Resume> = {
    name: extractName(rawText),
    email: extractEmail(rawText),
    phone: extractPhone(rawText),
    summary: extractSummary(rawText),
    sections: extractSections(rawText),
    skills: extractSkills(rawText),
    bullets: extractBullets(rawText),
  }

  return sanitizeResume(resume)
}

/**
 * Job description parser
 * Extracts title, keywords, responsibilities
 */
function parseJobDescriptionHeuristics(rawText: string): Job {
  const lines = rawText.split("\n")
  let title = "Unknown Position"
  let seniority: string | undefined
  const keywords: string[] = []
  const responsibilities: string[] = []

  // Common tech keywords to extract
  const techKeywords = [
    "javascript",
    "typescript",
    "python",
    "java",
    "react",
    "node.js",
    "nodejs",
    "aws",
    "docker",
    "kubernetes",
    "sql",
    "postgresql",
    "mongodb",
    "git",
    "html",
    "css",
    "tailwind",
    "next.js",
    "nextjs",
    "vue",
    "angular",
    "machine learning",
    "ai",
    "data science",
    "agile",
    "scrum",
    "ci/cd",
    "rest",
    "api",
    "graphql",
    "microservices",
    "redis",
    "elasticsearch",
  ]

  // Seniority levels
  const seniorityLevels = ["intern", "junior", "mid", "senior", "staff", "principal", "lead", "manager", "director"]

  // Extract title (usually first meaningful line or contains "role", "position", etc.)
  for (const line of lines.slice(0, 10)) {
    const trimmed = line.trim()
    if (
      trimmed.length > 5 &&
      trimmed.length < 100 &&
      !trimmed.toLowerCase().includes("about") &&
      !trimmed.toLowerCase().includes("company")
    ) {
      title = trimmed
      break
    }
  }

  // Extract seniority
  const textLower = rawText.toLowerCase()
  for (const level of seniorityLevels) {
    if (textLower.includes(level)) {
      seniority = level.charAt(0).toUpperCase() + level.slice(1)
      break
    }
  }

  // Extract keywords
  for (const keyword of techKeywords) {
    if (textLower.includes(keyword)) {
      keywords.push(keyword)
    }
  }

  // Extract responsibilities (bullet points in the job description)
  let inResponsibilitiesSection = false
  for (const line of lines) {
    const trimmed = line.trim()

    if (/responsibilities|requirements|qualifications|what\s+you['']?ll\s+do/i.test(trimmed)) {
      inResponsibilitiesSection = true
      continue
    }

    if (inResponsibilitiesSection && /^(about|benefits|perks|we\s+offer)/i.test(trimmed)) {
      inResponsibilitiesSection = false
    }

    if ((trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) && trimmed.length > 10) {
      responsibilities.push(trimmed.replace(/^[•\-*]\s*/, "").trim())
    }
  }

  return sanitizeJob({
    title,
    seniority,
    keywords: [...new Set(keywords)],
    responsibilities,
  })
}

function createBulletId(prefix: string, index: number): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${prefix}-${Date.now()}-${index}`
  }
}

async function parseResumeWithAI(rawText: string): Promise<Resume> {
  const result = await generateObject({
    model: RESUME_PARSER_MODEL,
    schema: AiResumeSchema,
    system: RESUME_PARSER_SYSTEM_PROMPT,
    prompt: `Extract structured resume JSON from the following text.\n\nRESUME:\n${rawText}`,
  })

  const parsed = result.object
  const normalized: Resume = {
    ...parsed,
    email: parsed.email || extractEmail(rawText),
    bullets: parsed.bullets.map((bullet, index) => ({
      id: bullet.id || createBulletId("ai-bullet", index),
      section: bullet.section || "Experience",
      company: bullet.company,
      start_date: bullet.start_date,
      end_date: bullet.end_date,
      raw_text: bullet.raw_text,
      action: bullet.action,
      impact: bullet.impact,
      metric_value: bullet.metric_value,
      metric_unit: bullet.metric_unit,
    })),
  }

  return sanitizeResume(normalized)
}

async function parseJobWithAI(rawText: string): Promise<Job> {
  const result = await generateObject({
    model: JOB_PARSER_MODEL,
    schema: AiJobSchema,
    system: JOB_PARSER_SYSTEM_PROMPT,
    prompt: `Extract structured job JSON from the following posting.\n\nJOB DESCRIPTION:\n${rawText}`,
  })

  return sanitizeJob(result.object)
}

export async function parseResume(rawText: string): Promise<Resume> {
  if (USE_AI_PARSING) {
    try {
      return await parseResumeWithAI(rawText)
    } catch (error) {
      console.warn("[Parser] AI resume parsing failed, falling back to heuristics", error)
    }
  }

  return parseResumeHeuristics(rawText)
}

export async function parseJobDescription(rawText: string): Promise<Job> {
  if (USE_AI_PARSING) {
    try {
      return await parseJobWithAI(rawText)
    } catch (error) {
      console.warn("[Parser] AI job parsing failed, falling back to heuristics", error)
    }
  }

  return parseJobDescriptionHeuristics(rawText)
}
