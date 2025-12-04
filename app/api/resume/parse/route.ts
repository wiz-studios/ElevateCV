/**
 * POST /api/resume/parse
 * Parse raw resume text into structured JSON
 */

import { type NextRequest, NextResponse } from "next/server"
import { parseResume } from "@/src/services/parser"
import { validateResume } from "@/src/utils/schema-validator"
import { logAuditEvent } from "@/src/services/audit"
import { optionalAuthMiddleware } from "@/src/middleware/auth"
import type { ParseResumeRequest, ParseResumeResponse } from "@/src/types/resume"

export async function POST(request: NextRequest) {
  try {
    const body: ParseResumeRequest = await request.json()

    const user = await optionalAuthMiddleware(request)

    if (!body.raw_text || typeof body.raw_text !== "string") {
      return NextResponse.json<ParseResumeResponse>(
        { success: false, error: "Missing or invalid raw_text field" },
        { status: 400 },
      )
    }

    const resume = await parseResume(body.raw_text)

    logAuditEvent("ai.parse_resume", {
      userId: user?.id || null,
      metadata: {
        textLength: body.raw_text.length,
        sectionsFound: resume.sections?.length || 0,
        skillsFound: resume.skills?.length || 0,
        bulletsFound: resume.bullets?.length || 0,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
    })

    if (!validateResume(resume)) {
      return NextResponse.json<ParseResumeResponse>(
        { success: false, error: "Failed to parse resume into valid structure" },
        { status: 422 },
      )
    }

    return NextResponse.json<ParseResumeResponse>({
      success: true,
      data: resume,
    })
  } catch (error) {
    console.error("[API] Resume parse error:", error)
    return NextResponse.json<ParseResumeResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
