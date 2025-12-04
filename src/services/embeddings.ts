/**
 * Embedding Service
 * Provides embedding-based similarity search between job responsibilities and resume bullets.
 */

import { embed } from "ai"
import type { Resume } from "@/src/types/resume"
import type { Job } from "@/src/types/job"
import type { BulletSimilarityMatch } from "@/src/types/tailor"

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small"
const MAX_BULLETS = Number(process.env.SIMILARITY_MAX_BULLETS || 20)
const MAX_RESPONSIBILITIES = Number(process.env.SIMILARITY_MAX_RESPONSIBILITIES || 10)
const MIN_SIMILARITY = Number(process.env.SIMILARITY_THRESHOLD || 0.55)

async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const result = await embed({
      model: EMBEDDING_MODEL,
      value: text,
    })
    return result.embedding
  } catch (error) {
    console.warn("[Embeddings] Failed to generate embedding", error)
    return null
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  const minLength = Math.min(a.length, b.length)
  if (!minLength) return 0

  let dot = 0
  let magA = 0
  let magB = 0

  for (let i = 0; i < minLength; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }

  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

export async function findSimilarBullets(resume: Resume, job: Job): Promise<BulletSimilarityMatch[]> {
  try {
    const responsibilities = (job.responsibilities || [])
      .map((resp) => resp.trim())
      .filter((resp) => resp.length > 10)
      .slice(0, MAX_RESPONSIBILITIES)

    if (responsibilities.length === 0) {
      return []
    }

    const bulletPool = resume.bullets
      .map((bullet) => ({
        ...bullet,
        text: (bullet.tailored_text || bullet.raw_text || "").trim(),
      }))
      .filter((bullet) => bullet.text.length > 10)
      .slice(0, MAX_BULLETS)

    if (bulletPool.length === 0) {
      return []
    }

    const bulletEmbeddings = await Promise.all(
      bulletPool.map(async (bullet) => ({
        bullet,
        embedding: await generateEmbedding(bullet.text),
      })),
    )

    const responsibilityEmbeddings = await Promise.all(
      responsibilities.map(async (responsibility) => ({
        responsibility,
        embedding: await generateEmbedding(responsibility),
      })),
    )

    const matches: BulletSimilarityMatch[] = []

    for (const responsibility of responsibilityEmbeddings) {
      if (!responsibility.embedding) continue

      let bestMatch: { bullet: typeof bulletPool[number]; similarity: number } | null = null

      for (const bullet of bulletEmbeddings) {
        if (!bullet.embedding) continue

        const similarity = cosineSimilarity(responsibility.embedding, bullet.embedding)
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { bullet: bullet.bullet, similarity }
        }
      }

      if (bestMatch && bestMatch.similarity >= MIN_SIMILARITY) {
        matches.push({
          responsibility: responsibility.responsibility,
          bullet_id: bestMatch.bullet.id,
          bullet_text: bestMatch.bullet.text,
          similarity: Number(bestMatch.similarity.toFixed(2)),
          section: bestMatch.bullet.section,
          company: bestMatch.bullet.company,
        })
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity)
  } catch (error) {
    console.warn("[Embeddings] findSimilarBullets error, returning empty results:", error)
    return []
  }
}



