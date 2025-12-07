import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { FileText } from "lucide-react"

export const metadata = {
  title: "Login - ElevateCV",
  description: "Sign in to your account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
        backgroundSize: "24px 24px"
      }}></div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-3 mb-8 transition-transform hover:scale-105 active:scale-95">
          <div className="p-2.5 bg-foreground rounded-xl shadow-lg">
            <FileText className="h-6 w-6 text-background" />
          </div>
          <span className="text-2xl font-bold tracking-tight">ElevateCV</span>
        </Link>

        <LoginForm />
      </div>
    </div>
  )
}
