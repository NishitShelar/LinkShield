"use client"
import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const { token } = use(params)
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.verifyEmail(token)
        if (response.success) {
          setStatus("success")
          setMessage("Email verified successfully! You can now log in.")
          setTimeout(() => router.push("/login"), 3000)
        } else {
          setStatus("error")
          setMessage(response.error || "Email verification failed. The link may be invalid or expired.")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      }
    }

    if (token) verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <div className="mb-6">
          {status === "loading" && <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />}
          {status === "success" && <CheckCircle className="w-12 h-12 mx-auto text-green-600" />}
          {status === "error" && <XCircle className="w-12 h-12 mx-auto text-red-600" />}
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {status === "loading" && "Verifying Email..."}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h1>

        <p className="text-gray-600 mb-6">{message}</p>

        {status === "success" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Redirecting to login in 3 seconds...</p>
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">Continue to Login</Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <Link href="/register">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">Back to Registration</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Try to Login
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </Card>
    </div>
  )
}
