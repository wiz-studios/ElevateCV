"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Briefcase, Wand2, Download, LogIn, UserPlus, RefreshCw } from "lucide-react"

interface AuditLog {
  id: string
  timestamp: string
  action: string
  metadata: Record<string, unknown>
  success: boolean
}

interface AIStats {
  total_tailors: number
  successful_tailors: number
  failed_tailors: number
  total_parses: number
  last_activity?: string
}

const actionIcons: Record<string, React.ReactNode> = {
  "ai.tailor_request": <Wand2 className="h-4 w-4" />,
  "ai.tailor_success": <Wand2 className="h-4 w-4 text-green-500" />,
  "ai.parse_resume": <FileText className="h-4 w-4" />,
  "ai.parse_job": <Briefcase className="h-4 w-4" />,
  "pdf.export": <Download className="h-4 w-4" />,
  "auth.login": <LogIn className="h-4 w-4" />,
  "auth.signup": <UserPlus className="h-4 w-4" />,
}

const actionLabels: Record<string, string> = {
  "ai.tailor_request": "Resume Tailoring",
  "ai.tailor_success": "Tailoring Complete",
  "ai.tailor_failed": "Tailoring Failed",
  "ai.parse_resume": "Resume Parsed",
  "ai.parse_job": "Job Parsed",
  "pdf.export": "PDF Export",
  "auth.login": "Login",
  "auth.signup": "Account Created",
  "auth.logout": "Logout",
}

export default function ActivityPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AIStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  const fetchActivity = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ limit: "100" })
      if (filter !== "all") {
        params.set("action", filter)
      }

      const res = await fetch(`/api/audit?${params}`, {
        credentials: "include",
      })
      const data = await res.json()

      if (data.success) {
        setLogs(data.data.logs)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch activity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
  }, [filter])

  return (
    <ProtectedRoute>
      <main className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground mt-1">View your recent activity and AI usage statistics</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Tailors</CardDescription>
                <CardTitle className="text-2xl">{stats.total_tailors}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Successful</CardDescription>
                <CardTitle className="text-2xl text-green-600">{stats.successful_tailors}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Failed</CardDescription>
                <CardTitle className="text-2xl text-red-600">{stats.failed_tailors}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Parses</CardDescription>
                <CardTitle className="text-2xl">{stats.total_parses}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent actions and events</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activity</SelectItem>
                    <SelectItem value="ai.tailor_request">Tailoring</SelectItem>
                    <SelectItem value="ai.parse_resume">Resume Parse</SelectItem>
                    <SelectItem value="ai.parse_job">Job Parse</SelectItem>
                    <SelectItem value="pdf.export">PDF Export</SelectItem>
                    <SelectItem value="auth.login">Login</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchActivity}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity found. Start by parsing a resume!
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {actionIcons[log.action] || <FileText className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{actionLabels[log.action] || log.action}</p>
                        {!log.success && (
                          <Badge variant="destructive" className="text-xs">
                            Failed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {log.action === "ai.tailor_success" && log.metadata.matchScore && (
                            <span>Match score: {((log.metadata.matchScore as number) * 100).toFixed(0)}%</span>
                          )}
                          {log.action === "ai.parse_resume" && (
                            <span>
                              {log.metadata.sectionsFound} sections, {log.metadata.skillsFound} skills
                            </span>
                          )}
                          {log.action === "ai.parse_job" && log.metadata.title && (
                            <span>Job: {log.metadata.title as string}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  )
}
