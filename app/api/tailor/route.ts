/**
 * POST /api/tailor
 * Tailor resume to match job description using AI
 * Updated with proper auth middleware integration and audit logging
 */

import { type NextRequest, NextResponse } from "next/server"
import { tailorResume, tailorResumeStub } from "@/src/services/ai"
import { validateResume, validateJob } from "@/src/utils/schema-validator"
import { consumeQuota, getBillingUsage } from "@/src/services/billing"
import { protectedTailorMiddleware, optionalAuthMiddleware } from "@/src/middleware/auth"
import { logAuditEvent } from "@/src/services/audit"
import { findSimilarBullets } from "@/src/services/embeddings"
import type { TailorRequest, TailorResponse, BulletSimilarityMatch } from "@/src/types/tailor"

const USE_AI = process.env.USE_AI_TAILORING === "true"

export async function POST(request: NextRequest) {
  try {
    const body: TailorRequest = await request.json()

    const authResult = await protectedTailorMiddleware(request)

    // If auth fails, allow demo mode for unauthenticated users
    let userId = "demo_user"
    let isAuthenticated = false

    if ("error" in authResult) {
      // Check if user provided demo header or is unauthenticated
      const demoMode = request.headers.get("x-demo-mode") === "true"
      if (!demoMode) {
        // For unauthenticated users, use optional auth
        const optionalUser = await optionalAuthMiddleware(request)
        if (!optionalUser) {
          // Allow limited demo access
          userId = `demo_${Date.now()}`
        } else {
          userId = optionalUser.id
          isAuthenticated = true
        }
      }
    } else {
      userId = authResult.user.id
      isAuthenticated = true
    }

    // Validate inputs
    if (!body.resume || !validateResume(body.resume)) {
      return NextResponse.json<TailorResponse>(
        { success: false, error: "Invalid or missing resume data" },
        { status: 400 },
      )
    }

    if (!body.job || !validateJob(body.job)) {
      return NextResponse.json<TailorResponse>(
        { success: false, error: "Invalid or missing job data" },
        { status: 400 },
      )
    }

    const style = body.style || "concise"
    if (style !== "concise" && style !== "detailed") {
      return NextResponse.json<TailorResponse>(
        { success: false, error: 'Style must be "concise" or "detailed"' },
        { status: 400 },
      )
    }

    logAuditEvent("ai.tailor_request", {
      userId: isAuthenticated ? userId : null,
      metadata: {
        style,
        resumeSections: body.resume.sections?.length || 0,
        jobKeywords: body.job.keywords?.length || 0,
        isAuthenticated,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    // Tailor resume
    let result
    try {
      result = USE_AI
        ? await tailorResume(body.resume, body.job, style)
        : tailorResumeStub(body.resume, body.job, style)

      logAuditEvent("ai.tailor_success", {
        userId: isAuthenticated ? userId : null,
        metadata: {
          matchScore: result.match_score,
          missingSkillsCount: result.missing_skills?.length || 0,
          tailoredBullets: result.resume.bullets.filter((b: any) => b.tailored_text).length || 0,
        },
      })
    } catch (aiError) {
      logAuditEvent("ai.tailor_failed", {
        userId: isAuthenticated ? userId : null,
        success: false,
        errorMessage: aiError instanceof Error ? aiError.message : "Unknown AI error",
      })
      throw aiError
    }

    let similarBullets: BulletSimilarityMatch[] = []
    try {
      similarBullets = await findSimilarBullets(result.resume, body.job)
    } catch (similarityError) {
      console.warn("[API] Bullet similarity failed", similarityError)
    }

    // Consume quota for authenticated users
    if (isAuthenticated) {
      await consumeQuota(userId)
    }

    // Get remaining quota for response
    const billing = await getBillingUsage(userId)
    const remainingQuota =
      billing.monthly_quota === -1
        ? -1
        : Math.max(0, billing.monthly_quota - billing.monthly_used) + billing.credits_remaining

    return NextResponse.json<TailorResponse>({
      success: true,
      data: {
        ...result,
        remaining_quota: remainingQuota,
        similar_bullets: similarBullets,
      },
    })
  } catch (error) {
    console.error("[API] Tailor error:", error)
    return NextResponse.json<TailorResponse>({ success: false, error: "Failed to tailor resume" }, { status: 500 })
  }
}
