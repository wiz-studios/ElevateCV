import { type NextRequest, NextResponse } from "next/server"
import { suggestImprovements, suggestImprovementsStub } from "@/src/services/ai"
import { validateResume, validateJob } from "@/src/utils/schema-validator"
import { consumeQuota, getBillingUsage } from "@/src/services/billing"
import { protectedTailorMiddleware } from "@/src/middleware/auth"
import { logAuditEvent } from "@/src/services/audit"
import type { Resume } from "@/src/types/resume"
import type { Job } from "@/src/types/job"

const USE_AI = process.env.USE_AI_TAILORING === "true"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { resume, job } = body

        // Auth check
        const authResult = await protectedTailorMiddleware(request)
        if ("error" in authResult) {
            return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
        }
        const userId = authResult.user.id

        // Validation
        if (!resume || !validateResume(resume)) {
            return NextResponse.json({ success: false, error: "Invalid resume data" }, { status: 400 })
        }
        if (!job || !validateJob(job)) {
            return NextResponse.json({ success: false, error: "Invalid job data" }, { status: 400 })
        }

        // Audit Log
        logAuditEvent("ai.improvements_request", {
            userId,
            metadata: { resumeSections: resume.sections?.length || 0 },
        })

        // Generate Improvements
        let result
        try {
            result = USE_AI
                ? await suggestImprovements(resume, job)
                : suggestImprovementsStub(resume, job)

            logAuditEvent("ai.improvements_success", {
                userId,
                metadata: { suggestionCount: result.suggestions.length, score: result.overall_score },
            })
        } catch (error) {
            console.warn("[API] AI improvements failed, falling back to stub")
            result = suggestImprovementsStub(resume, job)
        }

        // Quota Consumption (Optional: decide if this consumes credits)
        // For now, let's say it does NOT consume extra credits if they already paid for tailoring, 
        // or maybe it consumes a small amount. Let's skip quota for this specific "advice" feature for now 
        // to encourage usage, or uncomment below to charge.
        // await consumeQuota(userId) 

        return NextResponse.json({ success: true, data: result })

    } catch (error) {
        console.error("[API] Improvements error:", error)
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
}
