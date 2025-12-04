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
