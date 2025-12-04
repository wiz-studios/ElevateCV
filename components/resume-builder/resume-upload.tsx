"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Loader2 } from "lucide-react"
import { EXAMPLE_RESUME_TEXT } from "@/lib/example-data"

interface ResumeUploadProps {
  onParsed: (resume: unknown) => void
}

export function ResumeUpload({ onParsed }: ResumeUploadProps) {
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type === "text/plain") {
      const content = await file.text()
      setText(content)
    } else {
      setError("Currently only .txt files are supported. DOCX support coming soon.")
    }
  }, [])

  const handleParse = async () => {
    if (!text.trim()) {
      setError("Please enter or upload resume text")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: text }),
      })

      const result = await response.json()

      if (result.success) {
        onParsed(result.data)
      } else {
        setError(result.error || "Failed to parse resume")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadExample = () => {
    setText(EXAMPLE_RESUME_TEXT)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume Input
        </CardTitle>
        <CardDescription>Paste your resume text or upload a file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".txt,.docx" onChange={handleFileUpload} className="hidden" />
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </span>
            </Button>
          </label>
          <Button variant="ghost" onClick={loadExample}>
            Load Example
          </Button>
        </div>

        <Textarea
          placeholder="Paste your resume text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="font-mono text-sm"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleParse} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Parsing...
            </>
          ) : (
            "Parse Resume"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
