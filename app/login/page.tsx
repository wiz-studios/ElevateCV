import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { FileText } from "lucide-react"

export const metadata = {
  title: "Login - ElevateCV",
  description: "Sign in to your account",
}

export default function LoginPage() {
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
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Welcome back</h2>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
