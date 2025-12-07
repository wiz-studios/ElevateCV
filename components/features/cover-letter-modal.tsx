"use client"
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lock, Loader2, Copy, Check, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Resume } from "@/src/types/resume"
import type { Job } from "@/src/types/job"

interface CoverLetterModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    resume: Resume | null
    job: Job | null
}

export function CoverLetterModal({ open, onOpenChange, resume, job }: CoverLetterModalProps) {
    const { user } = useAuth()
    const isFreePlan = !user || user.plan === "free"
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ subject: string; content: string } | null>(null)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        if (!resume || !job) return
        setIsLoading(true)
        try {
            const response = await fetch("/api/generate-cover-letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resume, job }),
            })
            const data = await response.json()
            if (data.success) {
                setResult(data.data)
            }
        } catch (error) {
            console.error("Failed to generate cover letter:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Cover Letter Generator
                    </DialogTitle>
                    <DialogDescription>
                        Generate a tailored cover letter based on your resume and the job description.
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
                                Upgrade to Premium to unlock AI-powered cover letter generation tailored to every job application.
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
                                    Ready to generate a cover letter for this role?
                                </p>
                                <Button onClick={handleGenerate} disabled={isLoading || !resume || !job}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        "Generate Cover Letter"
                                    )}
                                </Button>
                                {(!resume || !job) && (
                                    <p className="text-xs text-destructive">
                                        Please ensure you have parsed both a resume and a job description.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
                                    <div className="font-medium border-b pb-2">Subject: {result.subject}</div>
                                    <div className="whitespace-pre-wrap text-sm">{result.content}</div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => {
                                        navigator.clipboard.writeText(`${result.subject}\n\n${result.content}`)
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 2000)
                                    }}>
                                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                        {copied ? "Copied" : "Copy to Clipboard"}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setResult(null)}>
                                        Generate New
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
