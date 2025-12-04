"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, Mail, Shield, Loader2, Check, AlertCircle } from "lucide-react"

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  )
}

function AccountContent() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setUpdateMessage(null)

    // TODO: Implement profile update API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setUpdateMessage({ type: "success", text: "Profile updated successfully" })
    setIsUpdating(false)
    refreshUser()
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Account Settings</h1>
              <p className="text-muted-foreground">Manage your profile and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {updateMessage && (
                  <Alert variant={updateMessage.type === "error" ? "destructive" : "default"}>
                    {updateMessage.type === "success" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{updateMessage.text}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input id="email" value={user.email} disabled className="bg-muted" />
                    {user.email_verified ? (
                      <Badge variant="secondary" className="shrink-0">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Account Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <Badge variant={user.plan === "premium" ? "default" : "outline"}>
                  {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-medium">{user.credits}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              {user.plan !== "premium" && (
                <>
                  <Separator />
                  <Button asChild className="w-full">
                    <Link href="/pricing">Upgrade Plan</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/change-password">Change Password</Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center">We recommend using a strong, unique password</p>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                This will permanently delete your account and all data
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
