import { type NextRequest, NextResponse } from "next/server"
import { generateCoverLetter, generateCoverLetterStub } from "@/src/services/ai"
import { validateResume, validateJob } from "@/src/utils/schema-validator"
import { protectedTailorMiddleware } from "@/src/middleware/auth"
import { logAuditEvent } from "@/src/services/audit"

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
        logAuditEvent("ai.cover_letter_request", { userId })

        // Generate
        let result
        try {
            result = USE_AI
                ? await generateCoverLetter(resume, job)
                : generateCoverLetterStub(resume, job)

            logAuditEvent("ai.cover_letter_success", { userId })
        } catch (error) {
            console.warn("[API] AI generation failed, falling back to stub")
            result = generateCoverLetterStub(resume, job)
        }

        return NextResponse.json({ success: true, data: result })

    } catch (error) {
        console.error("[API] Cover letter error:", error)
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
}
