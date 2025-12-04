/**
 * POST /api/ats-score
 * Calculate ATS compatibility score for resume against job
 */

import { type NextRequest, NextResponse } from "next/server"
import { checkATSCompatibility } from "@/src/utils/ats-checker"
import { validateResume, validateJob } from "@/src/utils/schema-validator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.resume || !validateResume(body.resume)) {
      return NextResponse.json({ success: false, error: "Invalid or missing resume data" }, { status: 400 })
    }

    if (!body.job || !validateJob(body.job)) {
      return NextResponse.json({ success: false, error: "Invalid or missing job data" }, { status: 400 })
    }

    const score = checkATSCompatibility(body.resume, body.job)

    return NextResponse.json({
      success: true,
      data: score,
    })
  } catch (error) {
    console.error("[API] ATS score error:", error)
    return NextResponse.json({ success: false, error: "Failed to calculate ATS score" }, { status: 500 })
  }
}
