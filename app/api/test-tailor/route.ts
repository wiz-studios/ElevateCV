/**
 * Test endpoint for tailor function
 */

import { type NextRequest, NextResponse } from "next/server"
import { tailorResumeStub } from "@/src/services/ai"
import type { Resume } from "@/src/types/resume"
import type { Job } from "@/src/types/job"

export async function GET(request: NextRequest) {
  try {
    // Create minimal test data
    const testResume: Resume = {
      name: "John Doe",
      email: "john@example.com",
      phone: "555-0000",
      summary: "Software engineer with 5 years experience",
      sections: ["Experience", "Education", "Skills"],
      skills: ["JavaScript", "React", "Node.js", "Python"],
      bullets: [
        {
          id: "1",
          section: "Experience",
          company: "Tech Corp",
          start_date: "2020-01",
          end_date: "2024-01",
          raw_text: "Built and maintained React applications",
          action: "Built",
          impact: "Improved performance by 30%",
        },
      ],
    }

    const testJob: Job = {
      title: "Senior React Developer",
      seniority: "senior",
      company: "Big Tech",
      location: "Remote",
      keywords: ["React", "JavaScript", "REST API", "Docker"],
      responsibilities: ["Lead frontend development", "Mentor junior developers"],
    }

    const result = tailorResumeStub(testResume, testJob, "concise")

    console.log("[Test] Tailor result:", {
      matchScore: result.match_score,
      bulletCount: result.resume.bullets.length,
      missingSkillsCount: result.missing_skills.length,
      firstBullet: result.resume.bullets[0]?.tailored_text,
    })

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("[Test] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
