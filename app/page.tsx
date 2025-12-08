"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { UserMenu } from "@/components/auth/user-menu"
import { ResumeUpload } from "@/components/resume-builder/resume-upload"
import { JobInput } from "@/components/resume-builder/job-input"
import { TailorControls } from "@/components/resume-builder/tailor-controls"
import { ResumePreview } from "@/components/resume-builder/resume-preview"
import { JSONPreview } from "@/components/resume-builder/json-preview"
import { ATSScoreCard } from "@/components/resume-builder/ats-score-card"
import { SimilarityPanel } from "@/components/resume-builder/similarity-panel"
import { TemplateSelector } from "@/components/resume-builder/template-selector"
import { UsageDisplay } from "@/components/billing/usage-display"
import { UpgradeModal } from "@/components/billing/upgrade-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Crown, FileText, Sparkles, LayoutTemplate, FileJson, Briefcase } from "lucide-react"
import type { Resume } from "@/src/types/resume"
import type { Job } from "@/src/types/job"
import type { ATSScore, TailorResponseData, BulletSimilarityMatch } from "@/src/types/tailor"
import type { ResumeTemplate } from "@/src/types/template"

export default function ResumeBuildPage() {
  const { isAuthenticated, user } = useAuth()
  const [resume, setResume] = useState<Resume | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [tailoredResume, setTailoredResume] = useState<Resume | null>(null)
  const [matchScore, setMatchScore] = useState<number | undefined>()
  const [missingSkills, setMissingSkills] = useState<string[]>([])
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null)
  const [showHeaderUpgrade, setShowHeaderUpgrade] = useState(false)
  const [similarBullets, setSimilarBullets] = useState<BulletSimilarityMatch[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>("professional")

  useEffect(() => {
    async function calculateATS() {
      const currentResume = tailoredResume || resume
      if (!currentResume || !job) {
        setAtsScore(null)
        return
      }

      try {
        const response = await fetch("/api/ats-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: currentResume, job }),
        })
        const result = await response.json()
        if (result.success) {
          setAtsScore(result.data)
        }
      } catch (err) {
        console.error("ATS calculation failed:", err)
      }
    }

    calculateATS()
  }, [resume, job, tailoredResume])

  const handleResumeParsed = (parsedResume: unknown) => {
    setResume(parsedResume as Resume)
    setTailoredResume(null)
    setMatchScore(undefined)
    setMissingSkills([])
    setSimilarBullets([])
  }

  const handleJobParsed = (parsedJob: unknown) => {
    setJob(parsedJob as Job)
    setSimilarBullets([])
  }

  const handleTailored = (result: TailorResponseData) => {
    setTailoredResume(result.resume)
    setMatchScore(result.match_score)
    setMissingSkills(result.missing_skills)
    setSimilarBullets(result.similar_bullets || [])
  }

  const displayResume = tailoredResume || resume

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-3 transition-opacity hover:opacity-70 flex-shrink-0">
            <div className="p-1.5 sm:p-2 bg-foreground rounded-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-background" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight">ElevateCV</h1>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-4">
            <Link href="/how-it-works" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            {isAuthenticated && (
              <>
                <div className="hidden lg:block">
                  <UsageDisplay compact onUpgradeClick={() => setShowHeaderUpgrade(true)} />
                </div>
                {user?.plan === "free" && (
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => setShowHeaderUpgrade(true)}
                    className="hidden lg:flex bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-sm text-xs sm:text-sm"
                  >
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Upgrade Pro</span>
                    <span className="sm:hidden">Pro</span>
                  </Button>
                )}
              </>
            )}
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 overflow-x-hidden">
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-start">
          {/* Left Column: Builder Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <div className="h-6 sm:h-8 w-1 bg-primary rounded-full flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold">Builder Inputs</h2>
            </div>

            {/* Resume Input */}
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6 bg-muted/30 border-b border-border/50">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                  Resume Content
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Upload your existing resume or paste content</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <ResumeUpload onParsed={handleResumeParsed} />
              </CardContent>
            </Card>

            {/* Job Input */}
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6 bg-muted/30 border-b border-border/50">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                  Target Job
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Paste the job description you want to apply for</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <JobInput onParsed={handleJobParsed} />
              </CardContent>
            </Card>

            {/* Tailor Controls */}
            <Card className="border-none shadow-lg ring-1 ring-primary/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  AI Customization
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Configure how the AI should tailor your resume</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <TailorControls
                  resume={resume}
                  job={job}
                  onTailored={handleTailored}
                  template={selectedTemplate}
                />
              </CardContent>
            </Card>

            {/* Template Selector */}
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6 bg-muted/30 border-b border-border/50">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-primary flex-shrink-0" />
                  Design Template
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <TemplateSelector selectedTemplate={selectedTemplate} onTemplateChange={setSelectedTemplate} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Preview & Results (7 cols) */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <div className="h-6 sm:h-8 w-1 bg-green-500 rounded-full flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold">Live Preview</h2>
            </div>

            <Tabs defaultValue="preview" className="w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                <TabsList className="bg-muted/50 p-1 border w-full sm:w-auto">
                  <TabsTrigger value="preview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm flex-1 sm:flex-none">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Visual Preview</span>
                    <span className="sm:hidden">Preview</span>
                  </TabsTrigger>
                  <TabsTrigger value="json" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm flex-1 sm:flex-none">
                    <FileJson className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Data View</span>
                    <span className="sm:hidden">Data</span>
                  </TabsTrigger>
                </TabsList>

                {matchScore !== undefined && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-xs sm:text-sm font-medium border border-green-500/20 w-full sm:w-auto justify-center sm:justify-start">
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">Match: {matchScore}%</span>
                  </div>
                )}
              </div>

              <TabsContent value="preview" className="space-y-6 mt-0">
                {displayResume ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ResumePreview
                      resume={displayResume}
                      matchScore={matchScore}
                      missingSkills={missingSkills}
                    />

                    {atsScore && <ATSScoreCard score={atsScore} />}

                    <SimilarityPanel matches={similarBullets} />
                  </div>
                ) : (
                  <Card className="border-dashed border-2 bg-muted/30 min-h-[600px] flex flex-col items-center justify-center text-center p-8">
                    <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Ready to Build</h3>
                    <p className="text-muted-foreground max-w-md">
                      Upload your resume and a job description on the left to generate a tailored, ATS-optimized preview here.
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="json" className="mt-0">
                <Card className="border-none shadow-md">
                  <CardContent className="p-0">
                    <Tabs defaultValue="resume-json" className="w-full">
                      <div className="border-b px-4 py-2 bg-muted/30">
                        <TabsList className="bg-transparent h-auto p-0 gap-4">
                          <TabsTrigger
                            value="resume-json"
                            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 py-2"
                          >
                            Resume JSON
                          </TabsTrigger>
                          <TabsTrigger
                            value="job-json"
                            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 py-2"
                          >
                            Job JSON
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="resume-json" className="m-0">
                        {displayResume ? (
                          <JSONPreview title="Parsed Resume Data" data={displayResume} />
                        ) : (
                          <div className="p-12 text-center text-muted-foreground">
                            No resume data available yet
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="job-json" className="m-0">
                        {job ? (
                          <JSONPreview title="Parsed Job Data" data={job} />
                        ) : (
                          <div className="p-12 text-center text-muted-foreground">
                            No job data available yet
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <footer className="border-t mt-8 sm:mt-12 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <p>© 2024 ElevateCV. All rights reserved.</p>
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
              <Link href="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>

      <UpgradeModal open={showHeaderUpgrade} onOpenChange={setShowHeaderUpgrade} />
    </div>
  )
}
