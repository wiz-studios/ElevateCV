import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Loader2 } from "lucide-react"

function ResetPasswordLoading() {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <Suspense fallback={<ResetPasswordLoading />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  )
}
