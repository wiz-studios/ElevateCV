/**
 * POST /api/pdf
 * Generate PDF from resume JSON
 * Returns HTML for client-side PDF generation
 */

import { type NextRequest, NextResponse } from "next/server"
import { generateResumeHTML, generateResumePlainText } from "@/src/services/renderer"
import { validateResume } from "@/src/utils/schema-validator"
import { logAuditEvent } from "@/src/services/audit"
import { optionalAuthMiddleware } from "@/src/middleware/auth"
import type { ResumeTemplate } from "@/src/types/template"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const format = body.format || "html"

    const user = await optionalAuthMiddleware(request)

    if (!body.resume || !validateResume(body.resume)) {
      return NextResponse.json({ success: false, error: "Invalid or missing resume data" }, { status: 400 })
    }

    logAuditEvent("pdf.export", {
      userId: user?.id || null,
      metadata: {
        format,
        resumeName: body.resume.name,
        sectionsCount: body.resume.sections?.length || 0,
        bulletsCount: body.resume.bullets?.length || 0,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
    })

    if (format === "text") {
      const text = generateResumePlainText(body.resume)
      return new NextResponse(text, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="${body.resume.name.replace(/\s+/g, "_")}_Resume.txt"`,
        },
      })
    }

    // Return HTML for client-side PDF generation
    const template: ResumeTemplate = body.template || "professional"
    const html = generateResumeHTML(body.resume, template)
    return NextResponse.json({
      success: true,
      data: { html },
    })
  } catch (error) {
    console.error("[API] PDF generation error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate PDF" }, { status: 500 })
  }
}
