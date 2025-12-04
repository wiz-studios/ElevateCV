"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface JSONPreviewProps {
  title: string
  data: unknown
}

export function JSONPreview({ title, data }: JSONPreviewProps) {
  const [copied, setCopied] = useState(false)

  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Code className="h-4 w-4" />
          {title}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <pre className="bg-muted p-3 rounded-md overflow-auto max-h-[400px] text-xs">
          <code>{jsonString}</code>
        </pre>
      </CardContent>
    </Card>
  )
}
