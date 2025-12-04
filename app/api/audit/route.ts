/**
 * GET /api/audit
 * Get audit logs for authenticated user (or admin for all logs)
 */

import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/src/middleware/auth"
import { getUserAuditLogs, getAIUsageStats, getSystemStats } from "@/src/services/audit"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)

    if ("error" in authResult) {
      return authResult.error
    }

    const { user } = authResult
    const { searchParams } = new URL(request.url)

    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)
    const action = searchParams.get("action") as Parameters<typeof getUserAuditLogs>[1]["action"]
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    // Get user's audit logs
    const logs = getUserAuditLogs(user.id, {
      limit,
      action,
      startDate,
      endDate,
    })

    // Get AI usage stats
    const aiStats = getAIUsageStats(user.id)

    // Include system stats for enterprise users
    const systemStats = user.plan === "enterprise" ? getSystemStats() : undefined

    return NextResponse.json({
      success: true,
      data: {
        logs,
        stats: aiStats,
        systemStats,
      },
    })
  } catch (error) {
    console.error("[API] Audit logs error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
