/**
 * AI Tailoring Service
 * Handles resume tailoring using LLM
 * Uses Vercel AI SDK with AI Gateway
 */

import { generateObject } from "ai"
import { z } from "zod"
import type { Resume, TailoredResumeOutput } from "@/src/types/resume"
import type { Job } from "@/src/types/job"
import type { TailoringStyle } from "@/src/types/tailor"
import { getMissingSkills } from "@/src/utils/ats-checker"

// ============================================
// AI PROMPT TEMPLATES
// ============================================

export const TAILORING_SYSTEM_PROMPT = `You are an expert resume writer and career coach specializing in ATS-optimized resumes.

CRITICAL RULES:
1. NEVER invent or fabricate metrics, numbers, or statistics that weren't in the original resume
2. If a bullet lacks quantifiable metrics, add a "suggested_metric" field with a realistic suggestion the user can verify
3. Keep all tailored bullets concise (under 2 lines / 150 characters)
4. Naturally incorporate job keywords without keyword stuffing
5. Start bullets with strong action verbs
6. Maintain the original meaning and truthfulness of each bullet
7. Output valid JSON matching the exact schema provided

You will receive:
- Original resume JSON with bullets
- Target job description JSON with keywords and responsibilities
- Tailoring style preference (concise/detailed)

Your task is to rewrite each bullet's text to better match the job while following all rules above.`

export const TAILORING_USER_PROMPT = `
RESUME:
{resume_json}

JOB DESCRIPTION:
{job_json}

TAILORING STYLE: {style}

Instructions:
1. For each bullet in the resume, create a "tailored_text" that:
   - Incorporates relevant keywords from the job description naturally
   - Highlights relevant experience for this specific role
   - Keeps the same factual content as the original
   - Uses strong action verbs appropriate for the job level
   
2. If the original bullet lacks metrics:
   - DO NOT invent numbers
   - Add a "suggested_metric" field with a placeholder like "X% improvement in [metric]" or "Y users impacted"
   
3. Style guidelines:
   - "concise": Maximum 1 line, punchy, impact-focused
   - "detailed": Up to 2 lines, includes context and impact

4. Calculate match_score (0-1) based on:
   - Keyword overlap between resume and job
   - Skill alignment
   - Experience relevance

5. List missing_skills: keywords from job not found in resume

Return the complete tailored resume JSON with all fields populated.`

// ============================================
// ZOD SCHEMAS FOR AI OUTPUT
// ============================================

const TailoredBulletSchema = z.object({
  id: z.string(),
  section: z.string(),
  company: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  raw_text: z.string(),
  action: z.string().optional(),
  impact: z.string().optional(),
  metric_value: z.number().optional(),
  metric_unit: z.string().optional(),
  tailored_text: z.string(),
  suggested_metric: z.string().optional(),
})

const TailoredResumeSchema = z.object({
  resume: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    summary: z.string().optional(),
    sections: z.array(z.string()),
    skills: z.array(z.string()),
    bullets: z.array(TailoredBulletSchema),
  }),
  match_score: z.number().min(0).max(1),
  missing_skills: z.array(z.string()),
})

// ============================================
// MAIN TAILORING FUNCTION
// ============================================

/**
 * Tailor resume to job description using AI
 * @param resume - Original resume JSON
 * @param job - Target job JSON
 * @param style - concise or detailed
 */
export async function tailorResume(
  resume: Resume,
  job: Job,
  style: TailoringStyle = "concise",
): Promise<TailoredResumeOutput> {
  const prompt = TAILORING_USER_PROMPT.replace("{resume_json}", JSON.stringify(resume, null, 2))
    .replace("{job_json}", JSON.stringify(job, null, 2))
    .replace("{style}", style)

  try {
    const result = await generateObject({
      model: "openai/gpt-4o",
      schema: TailoredResumeSchema,
      system: TAILORING_SYSTEM_PROMPT,
      prompt,
    })

    return result.object as TailoredResumeOutput
  } catch (error) {
    console.error("[AI Service] Tailoring error:", error)
    throw new Error("Failed to tailor resume with AI")
  }
}

/**
 * Stub function for testing without AI
 * Simulates AI tailoring with basic transformations
 */
export function tailorResumeStub(resume: Resume, job: Job, style: TailoringStyle = "concise"): TailoredResumeOutput {
  // Calculate basic match score based on skill overlap
  const resumeSkillsLower = resume.skills.map((s) => s.toLowerCase())
  const matchedKeywords = job.keywords.filter(
    (k) =>
      resumeSkillsLower.includes(k.toLowerCase()) ||
      resume.bullets.some((b) => b.raw_text.toLowerCase().includes(k.toLowerCase())),
  )
  const matchScore = job.keywords.length > 0 ? matchedKeywords.length / job.keywords.length : 0.5

  // Get missing skills
  const missingSkills = getMissingSkills(resume, job)

  // Create tailored bullets (stub: add job title reference)
  const tailoredBullets = resume.bullets.map((bullet) => {
    const tailoredText =
      style === "concise"
        ? bullet.raw_text.substring(0, 100) + (bullet.raw_text.length > 100 ? "..." : "")
        : bullet.raw_text

    return {
      id: bullet.id,
      section: bullet.section,
      company: bullet.company,
      start_date: bullet.start_date,
      end_date: bullet.end_date,
      raw_text: bullet.raw_text,
      action: bullet.action,
      impact: bullet.impact,
      metric_value: bullet.metric_value,
      metric_unit: bullet.metric_unit,
      tailored_text: tailoredText,
      suggested_metric: bullet.metric_value === undefined ? "Consider adding: X% improvement or Y users impacted" : undefined,
    }
  })

  return {
    resume: {
      name: resume.name,
      email: resume.email,
      phone: resume.phone,
      summary: resume.summary,
      sections: resume.sections,
      skills: resume.skills,
      bullets: tailoredBullets,
    },
    match_score: Math.round(matchScore * 100) / 100,
    missing_skills: missingSkills,
  }
}

// ============================================
// IMPROVEMENT SUGGESTIONS (New Feature)
// ============================================

export interface ImprovementSuggestion {
  id: string
  category: "Content" | "Formatting" | "Keywords" | "Impact"
  suggestion: string
  reasoning: string
  priority: "High" | "Medium" | "Low"
}

export interface ImprovementResponse {
  suggestions: ImprovementSuggestion[]
  overall_score: number
}

const ImprovementSchema = z.object({
  suggestions: z.array(
    z.object({
      id: z.string(),
      category: z.enum(["Content", "Formatting", "Keywords", "Impact"]),
      suggestion: z.string(),
      reasoning: z.string(),
      priority: z.enum(["High", "Medium", "Low"]),
    })
  ),
  overall_score: z.number().min(0).max(100),
})

const IMPROVEMENT_SYSTEM_PROMPT = `You are an expert career coach. Analyze the resume against the job description and provide actionable improvements.
Focus on:
1. Missing keywords and skills
2. Quantifiable impact (metrics)
3. Clarity and formatting
4. Alignment with the job role

Provide specific, constructive feedback.`

const IMPROVEMENT_USER_PROMPT = `
RESUME:
{resume_json}

JOB DESCRIPTION:
{job_json}

Provide a list of specific improvements to increase the match score and impact.`

export async function suggestImprovements(resume: Resume, job: Job): Promise<ImprovementResponse> {
  const prompt = IMPROVEMENT_USER_PROMPT.replace("{resume_json}", JSON.stringify(resume, null, 2))
    .replace("{job_json}", JSON.stringify(job, null, 2))

  try {
    const result = await generateObject({
      model: "openai/gpt-4o",
      schema: ImprovementSchema,
      system: IMPROVEMENT_SYSTEM_PROMPT,
      prompt,
    })

    return result.object as ImprovementResponse
  } catch (error) {
    console.error("[AI Service] Improvement suggestion error:", error)
    throw new Error("Failed to generate improvements")
  }
}

export function suggestImprovementsStub(resume: Resume, job: Job): ImprovementResponse {
  const missingSkills = getMissingSkills(resume, job)

  const suggestions: ImprovementSuggestion[] = [
    {
      id: "1",
      category: "Keywords",
      suggestion: `Add missing keywords: ${missingSkills.slice(0, 3).join(", ")}`,
      reasoning: "These skills are prominent in the job description but missing from your resume.",
      priority: "High",
    },
    {
      id: "2",
      category: "Impact",
      suggestion: "Quantify your achievements with metrics.",
      reasoning: "Bullets with numbers (e.g., 'increased revenue by 20%') are more persuasive.",
      priority: "Medium",
    },
    {
      id: "3",
      category: "Content",
      suggestion: "Tailor your summary to the specific role.",
      reasoning: "A targeted summary helps recruiters quickly see your fit.",
      priority: "Medium",
    },
  ]

  return {
    suggestions,
    overall_score: 75,
  }
}

// ============================================
// EMBEDDING & SIMILARITY (Phase 2+)
// ============================================

/**
 * TODO: Phase 2 - Implement embedding-based similarity
 *
 * export async function generateEmbedding(text: string): Promise<number[]> {
 *   const result = await embed({
 *     model: 'openai/text-embedding-3-small',
 *     value: text,
 *   });
 *   return result.embedding;
 * }
 *
 * export function cosineSimilarity(a: number[], b: number[]): number {
 *   const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
 *   const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
 *   const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
 *   return dotProduct / (magnitudeA * magnitudeB);
 * }
 *
 * export async function findSimilarBullets(
 *   targetDescription: string,
 *   bulletEmbeddings: Map<string, number[]>
 * ): Promise<string[]> {
 *   const targetEmbedding = await generateEmbedding(targetDescription);
 *   const scores = Array.from(bulletEmbeddings.entries()).map(([id, emb]) => ({
 *     id,
 *     score: cosineSimilarity(targetEmbedding, emb),
 *   }));
 *   return scores.sort((a, b) => b.score - a.score).slice(0, 5).map(s => s.id);
 * }
 */

// ============================================
// COVER LETTER GENERATION
// ============================================

export interface CoverLetterResponse {
  content: string
  subject: string
}

const CoverLetterSchema = z.object({
  subject: z.string(),
  content: z.string(),
})

const COVER_LETTER_SYSTEM_PROMPT = `You are an expert career coach and professional writer.
Write a compelling, personalized cover letter that connects the candidate's experience to the job requirements.
The tone should be professional, confident, and enthusiastic.
Avoid generic templates. Use specific details from the resume and job description.`

const COVER_LETTER_USER_PROMPT = `
RESUME:
{resume_json}

JOB DESCRIPTION:
{job_json}

Write a cover letter that:
1. Addresses the hiring manager (if known) or "Hiring Team"
2. Hooks the reader with a strong opening
3. Highlights 2-3 key achievements relevant to the role
4. Demonstrates understanding of the company/role
5. Ends with a clear call to action

Return JSON with "subject" and "content" (markdown supported).`

export async function generateCoverLetter(resume: Resume, job: Job): Promise<CoverLetterResponse> {
  const prompt = COVER_LETTER_USER_PROMPT.replace("{resume_json}", JSON.stringify(resume, null, 2))
    .replace("{job_json}", JSON.stringify(job, null, 2))

  try {
    const result = await generateObject({
      model: "openai/gpt-4o",
      schema: CoverLetterSchema,
      system: COVER_LETTER_SYSTEM_PROMPT,
      prompt,
    })

    return result.object as CoverLetterResponse
  } catch (error) {
    console.error("[AI Service] Cover letter error:", error)
    throw new Error("Failed to generate cover letter")
  }
}

export function generateCoverLetterStub(resume: Resume, job: Job): CoverLetterResponse {
  const company = job.company || "the company"
  const title = job.title || "the role"
  const name = resume.name || "Candidate"

  return {
    subject: `Application for ${title} - ${name}`,
    content: `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${title} position. With my background in ${resume.skills.slice(0, 3).join(", ")}, I am confident in my ability to contribute to your team.

[AI Stub: This is a placeholder. In production, this would be a full, personalized cover letter generated by GPT-4 based on your specific experience and the job description.]

Sincerely,
${name}`,
  }
}

// ============================================
// LINKEDIN OPTIMIZATION
// ============================================

export interface LinkedInResponse {
  headline: string
  about: string
  experience_bullets: { company: string; bullets: string[] }[]
}

const LinkedInSchema = z.object({
  headline: z.string(),
  about: z.string(),
  experience_bullets: z.array(
    z.object({
      company: z.string(),
      bullets: z.array(z.string()),
    })
  ),
})

const LINKEDIN_SYSTEM_PROMPT = `You are a LinkedIn personal branding expert.
Optimize the user's profile for maximum visibility and impact.
1. Headline: Catchy, keyword-rich, value-driven (max 220 chars)
2. About: Engaging, conversational, storytelling approach (first person)
3. Experience: Punchy, metric-driven bullets optimized for skimming`

const LINKEDIN_USER_PROMPT = `
RESUME:
{resume_json}

JOB TARGET (Context):
{job_json}

Optimize the LinkedIn profile to attract recruiters for similar roles.
Return JSON with "headline", "about", and "experience_bullets".`

export async function optimizeLinkedIn(resume: Resume, job: Job): Promise<LinkedInResponse> {
  const prompt = LINKEDIN_USER_PROMPT.replace("{resume_json}", JSON.stringify(resume, null, 2))
    .replace("{job_json}", JSON.stringify(job, null, 2))

  try {
    const result = await generateObject({
      model: "openai/gpt-4o",
      schema: LinkedInSchema,
      system: LINKEDIN_SYSTEM_PROMPT,
      prompt,
    })

    return result.object as LinkedInResponse
  } catch (error) {
    console.error("[AI Service] LinkedIn optimization error:", error)
    throw new Error("Failed to optimize LinkedIn profile")
  }
}

export function optimizeLinkedInStub(resume: Resume, job: Job): LinkedInResponse {
  return {
    headline: `${job.title || "Professional"} | ${resume.skills.slice(0, 3).join(" | ")} | Driving Impact`,
    about: `I am a passionate professional with experience in ${resume.skills.slice(0, 3).join(", ")}. I love solving complex problems and driving business growth.

[AI Stub: This is a placeholder. Real AI would generate a compelling narrative about your career journey.]`,
    experience_bullets: resume.bullets.reduce((acc, curr) => {
      const existing = acc.find((i) => i.company === (curr.company || "Experience"))
      if (existing) {
        existing.bullets.push(curr.tailored_text || curr.raw_text)
      } else {
        acc.push({
          company: curr.company || "Experience",
          bullets: [curr.tailored_text || curr.raw_text],
        })
      }
      return acc
    }, [] as { company: string; bullets: string[] }[]).slice(0, 2),
  }
}

// ============================================
// AUTO-FIX IMPROVEMENTS
// ============================================

const ApplyImprovementsSchema = z.object({
  updated_resume: z.object({
    summary: z.string().optional(),
    bullets: z.array(TailoredBulletSchema),
    skills: z.array(z.string()),
  }),
})

const APPLY_IMPROVEMENTS_SYSTEM_PROMPT = `You are an expert resume editor.
Your task is to apply specific improvements to a resume based on a list of suggestions.
You must:
1. Rewrite the summary (if suggested) to be more targeted.
2. Rewrite specific bullets to incorporate metrics, keywords, or better action verbs as suggested.
3. Add missing skills to the skills list if suggested.
4. Maintain the original structure and truthfulness.
5. Return the updated fields.`

const APPLY_IMPROVEMENTS_USER_PROMPT = `
RESUME:
{resume_json}

JOB DESCRIPTION:
{job_json}

SUGGESTIONS TO APPLY:
{suggestions_json}

Instructions:
- Implement the "High" and "Medium" priority suggestions.
- If a suggestion says "Quantify achievements", try to infer realistic placeholders or restructure the sentence to highlight impact.
- If a suggestion says "Add keywords", naturally weave them into the summary or relevant bullets.
- Return the updated summary, bullets, and skills.`

export async function applyImprovements(
  resume: Resume,
  job: Job,
  suggestions: ImprovementSuggestion[]
): Promise<Partial<Resume>> {
  const prompt = APPLY_IMPROVEMENTS_USER_PROMPT.replace("{resume_json}", JSON.stringify(resume, null, 2))
    .replace("{job_json}", JSON.stringify(job, null, 2))
    .replace("{suggestions_json}", JSON.stringify(suggestions, null, 2))

  try {
    const result = await generateObject({
      model: "openai/gpt-4o",
      schema: ApplyImprovementsSchema,
      system: APPLY_IMPROVEMENTS_SYSTEM_PROMPT,
      prompt,
    })

    return result.object.updated_resume as Partial<Resume>
  } catch (error) {
    console.error("[AI Service] Apply improvements error:", error)
    throw new Error("Failed to apply improvements")
  }
}

export function applyImprovementsStub(
  resume: Resume,
  job: Job,
  suggestions: ImprovementSuggestion[]
): Partial<Resume> {
  // Stub logic: just append a note to the summary and add a skill
  const newSummary = (resume.summary || "") + "\n\n[Improved by AI: Added missing keywords and refined tone.]"
  const newSkills = [...resume.skills, "AI Optimized"]

  return {
    summary: newSummary,
    skills: newSkills,
    bullets: resume.bullets.map((b) => ({
      ...b,
      tailored_text: b.tailored_text ? b.tailored_text + " (Improved)" : b.raw_text + " (Improved)",
    })),
  }
}
