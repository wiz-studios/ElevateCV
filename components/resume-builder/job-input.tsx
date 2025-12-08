"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { EXAMPLE_JOB_TEXT } from "@/lib/example-data"

interface JobInputProps {
  onParsed: (job: unknown) => void
}

export function JobInput({ onParsed }: JobInputProps) {
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleParse = async () => {
    if (!text.trim()) {
      setError("Please enter a job description")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/job/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: text }),
      })

      const result = await response.json()

      if (result.success) {
        onParsed(result.data)
      } else {
        setError(result.error || "Failed to parse job description")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadExample = () => {
    setText(EXAMPLE_JOB_TEXT)
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={loadExample} size="sm">
        Load Example
      </Button>

      <Textarea
        placeholder="Paste job description here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        className="font-mono text-sm w-full resize-none"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleParse} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Parsing...
          </>
        ) : (
          "Parse Job Description"
        )}
      </Button>
    </div>
  )
}
