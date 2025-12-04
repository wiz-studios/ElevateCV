/**
 * Audit Log Service
 * Tracks all AI usage, authentication events, and billing actions for compliance
 */

export type AuditAction =
  | "auth.signup"
  | "auth.login"
  | "auth.logout"
  | "auth.password_reset_request"
  | "auth.password_reset_complete"
  | "auth.email_verified"
  | "ai.tailor_request"
  | "ai.tailor_success"
  | "ai.tailor_failed"
  | "ai.parse_resume"
  | "ai.parse_job"
  | "billing.subscription_created"
  | "billing.subscription_cancelled"
  | "billing.credits_purchased"
  | "billing.quota_exceeded"
  | "pdf.export"

export interface AuditLogEntry {
  id: string
  timestamp: string
  user_id: string | null
  action: AuditAction
  metadata: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
}

// In-memory storage for MVP (replace with database in production)
const auditLogs: AuditLogEntry[] = []

/**
 * Generate unique ID for audit log entry
 */
function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create an audit log entry
 */
export function logAuditEvent(
  action: AuditAction,
  options: {
    userId?: string | null
    metadata?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
    success?: boolean
    errorMessage?: string
  } = {},
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
    user_id: options.userId || null,
    action,
    metadata: options.metadata || {},
    ip_address: options.ipAddress,
    user_agent: options.userAgent,
    success: options.success ?? true,
    error_message: options.errorMessage,
  }

  auditLogs.push(entry)

  // Keep only last 10000 entries in memory
  if (auditLogs.length > 10000) {
    auditLogs.shift()
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[AUDIT] ${entry.action}`, {
      userId: entry.user_id,
      success: entry.success,
      metadata: entry.metadata,
    })
  }

  return entry
}

/**
 * Get audit logs for a user
 */
export function getUserAuditLogs(
  userId: string,
  options: {
    limit?: number
    action?: AuditAction
    startDate?: string
    endDate?: string
  } = {},
): AuditLogEntry[] {
  let logs = auditLogs.filter((log) => log.user_id === userId)

  if (options.action) {
    logs = logs.filter((log) => log.action === options.action)
  }

  if (options.startDate) {
    const start = new Date(options.startDate)
    logs = logs.filter((log) => new Date(log.timestamp) >= start)
  }

  if (options.endDate) {
    const end = new Date(options.endDate)
    logs = logs.filter((log) => new Date(log.timestamp) <= end)
  }

  // Sort by timestamp descending
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (options.limit) {
    logs = logs.slice(0, options.limit)
  }

  return logs
}

/**
 * Get AI usage statistics for a user
 */
export function getAIUsageStats(userId: string): {
  total_tailors: number
  successful_tailors: number
  failed_tailors: number
  total_parses: number
  last_activity?: string
} {
  const userLogs = auditLogs.filter((log) => log.user_id === userId)

  const tailorRequests = userLogs.filter((log) => log.action === "ai.tailor_request")
  const successfulTailors = userLogs.filter((log) => log.action === "ai.tailor_success")
  const failedTailors = userLogs.filter((log) => log.action === "ai.tailor_failed")
  const parses = userLogs.filter((log) => log.action === "ai.parse_resume" || log.action === "ai.parse_job")

  const sortedLogs = [...userLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return {
    total_tailors: tailorRequests.length,
    successful_tailors: successfulTailors.length,
    failed_tailors: failedTailors.length,
    total_parses: parses.length,
    last_activity: sortedLogs[0]?.timestamp,
  }
}

/**
 * Get system-wide statistics (admin only)
 */
export function getSystemStats(): {
  total_users: number
  total_tailors: number
  total_parses: number
  signups_today: number
  tailors_today: number
} {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const uniqueUsers = new Set(auditLogs.filter((log) => log.user_id).map((log) => log.user_id))
  const signupsToday = auditLogs.filter((log) => log.action === "auth.signup" && new Date(log.timestamp) >= startOfDay)
  const tailorsToday = auditLogs.filter(
    (log) => log.action === "ai.tailor_request" && new Date(log.timestamp) >= startOfDay,
  )

  return {
    total_users: uniqueUsers.size,
    total_tailors: auditLogs.filter((log) => log.action === "ai.tailor_request").length,
    total_parses: auditLogs.filter((log) => log.action === "ai.parse_resume" || log.action === "ai.parse_job").length,
    signups_today: signupsToday.length,
    tailors_today: tailorsToday.length,
  }
}
