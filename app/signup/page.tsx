import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { FileText } from "lucide-react"

export const metadata = {
  title: "Sign Up - ElevateCV",
  description: "Create your free account",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Link href="/" className="flex items-center gap-3 mb-12 transition-opacity hover:opacity-70">
        <div className="p-2 bg-foreground rounded-lg">
          <FileText className="h-7 w-7 text-background" />
        </div>
        <span className="text-2xl font-semibold tracking-tight">ElevateCV</span>
      </Link>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Create your account</h2>
          <p className="text-muted-foreground">Start building better resumes today</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
