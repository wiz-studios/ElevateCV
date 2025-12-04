/**
 * POST /api/job/parse
 * Parse raw job description into structured JSON
 */

import { type NextRequest, NextResponse } from "next/server"
import { parseJobDescription } from "@/src/services/parser"
import { validateJob } from "@/src/utils/schema-validator"
import { logAuditEvent } from "@/src/services/audit"
import { optionalAuthMiddleware } from "@/src/middleware/auth"
import type { ParseJobRequest, ParseJobResponse } from "@/src/types/job"

export async function POST(request: NextRequest) {
  try {
    const body: ParseJobRequest = await request.json()

    const user = await optionalAuthMiddleware(request)

    if (!body.raw_text || typeof body.raw_text !== "string") {
      return NextResponse.json<ParseJobResponse>(
        { success: false, error: "Missing or invalid raw_text field" },
        { status: 400 },
      )
    }

    const job = await parseJobDescription(body.raw_text)

    logAuditEvent("ai.parse_job", {
      userId: user?.id || null,
      metadata: {
        textLength: body.raw_text.length,
        title: job.title,
        keywordsFound: job.keywords?.length || 0,
        responsibilitiesFound: job.responsibilities?.length || 0,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
    })

    if (!validateJob(job)) {
      return NextResponse.json<ParseJobResponse>(
        { success: false, error: "Failed to parse job description into valid structure" },
        { status: 422 },
      )
    }

    return NextResponse.json<ParseJobResponse>({
      success: true,
      data: job,
    })
  } catch (error) {
    console.error("[API] Job parse error:", error)
    return NextResponse.json<ParseJobResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
