"use client"
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lock, Loader2, Copy, Check, Linkedin } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Resume } from "@/src/types/resume"
import type { Job } from "@/src/types/job"

interface LinkedInModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    resume: Resume | null
    job: Job | null
}

export function LinkedInModal({ open, onOpenChange, resume, job }: LinkedInModalProps) {
    const { user } = useAuth()
    const isFreePlan = !user || user.plan === "free"
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ headline: string; about: string; experience_bullets: any[] } | null>(null)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        if (!resume || !job) return
        setIsLoading(true)
        try {
            const response = await fetch("/api/optimize-linkedin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resume, job }),
            })
            const data = await response.json()
            if (data.success) {
                setResult(data.data)
            }
        } catch (error) {
            console.error("Failed to optimize LinkedIn:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-[#0077b5]" />
                        LinkedIn Optimization
                    </DialogTitle>
                    <DialogDescription>
                        Optimize your LinkedIn profile to attract recruiters for this role.
                    </DialogDescription>
                </DialogHeader>

                {isFreePlan ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <div className="bg-amber-100 p-4 rounded-full">
                            <Lock className="h-8 w-8 text-amber-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Premium Feature</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                Upgrade to Premium to unlock AI-powered LinkedIn profile optimization.
                            </p>
                        </div>
                        <Button className="gradient-accent text-white shadow-lg">
                            Upgrade to Premium
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {!result ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <p className="text-muted-foreground text-center mb-4">
                                    Ready to optimize your profile for this role?
                                </p>
                                <Button onClick={handleGenerate} disabled={isLoading || !resume || !job}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Optimizing...
                                        </>
                                    ) : (
                                        "Optimize Profile"
                                    )}
                                </Button>
                                {(!resume || !job) && (
                                    <p className="text-xs text-destructive">
                                        Please ensure you have parsed both a resume and a job description.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-muted-foreground">Headline</h4>
                                    <div className="p-3 bg-muted/30 rounded-md text-sm font-medium">
                                        {result.headline}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-muted-foreground">About Section</h4>
                                    <div className="p-3 bg-muted/30 rounded-md text-sm whitespace-pre-wrap">
                                        {result.about}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-muted-foreground">Key Experience Updates</h4>
                                    {result.experience_bullets.map((exp: any, idx: number) => (
                                        <div key={idx} className="p-3 bg-muted/30 rounded-md text-sm space-y-2">
                                            <div className="font-medium">{exp.company}</div>
                                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                                {exp.bullets.map((b: string, i: number) => (
                                                    <li key={i}>{b}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => {
                                        const text = `Headline:\n${result.headline}\n\nAbout:\n${result.about}`
                                        navigator.clipboard.writeText(text)
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 2000)
                                    }}>
                                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                        {copied ? "Copied" : "Copy All"}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setResult(null)}>
                                        Start Over
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
