import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { FileText } from "lucide-react"

export const metadata = {
  title: "Sign Up - AI Resume Builder",
  description: "Create your free account",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">AI Resume Builder</span>
      </Link>
      <SignupForm />
    </div>
  )
}
