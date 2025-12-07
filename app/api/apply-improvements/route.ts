import { NextRequest, NextResponse } from "next/server"
import { protectedTailorMiddleware } from "@/src/middleware/auth"
import { applyImprovements, applyImprovementsStub } from "@/src/services/ai"
import { validateResume, validateJob } from "@/src/utils/schema-validator"
import { logAuditEvent } from "@/src/services/audit"

export const maxDuration = 60 // Allow longer timeout for AI generation

export async function POST(req: NextRequest) {
    // 1. Auth & Quota Check
    const authResult = await protectedTailorMiddleware(req)
    if ("error" in authResult) {
        return authResult.error
    }

    const { user } = authResult

    try {
        const body = await req.json()
        const { resume, job, suggestions } = body

        // 2. Validation
        if (!validateResume(resume)) {
            return NextResponse.json({ success: false, error: "Invalid resume data" }, { status: 400 })
        }
        if (!validateJob(job)) {
            return NextResponse.json({ success: false, error: "Invalid job data" }, { status: 400 })
        }
        if (!suggestions || !Array.isArray(suggestions)) {
            return NextResponse.json({ success: false, error: "Invalid suggestions data" }, { status: 400 })
        }

        // 3. Log Request
        logAuditEvent("ai.improvements_request", {
            userId: user.id,
            metadata: {
                jobTitle: job.title,
                suggestionCount: suggestions.length,
            },
        })

        // 4. Generate Improvements
        let updatedData
        if (process.env.USE_AI_TAILORING === "true") {
            updatedData = await applyImprovements(resume, job, suggestions)
        } else {
            // Fallback to stub if AI is disabled or not configured
            updatedData = applyImprovementsStub(resume, job, suggestions)
        }

        // 5. Log Success
        logAuditEvent("ai.improvements_success", {
            userId: user.id,
            metadata: {
                jobTitle: job.title,
            },
        })

        return NextResponse.json({ success: true, data: updatedData })
    } catch (error) {
        console.error("[API] Apply improvements error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to apply improvements" },
            { status: 500 }
        )
    }
}
