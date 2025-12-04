import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { FileText } from "lucide-react"

export const metadata = {
  title: "Login - AI Resume Builder",
  description: "Sign in to your account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">AI Resume Builder</span>
      </Link>
      <LoginForm />
    </div>
  )
}
