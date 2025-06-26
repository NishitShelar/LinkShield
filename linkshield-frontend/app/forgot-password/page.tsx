"use client"
import { useState } from "react"
import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Shield, Mail, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.forgotPassword(email)
      if (response.success) {
        setSuccess(true)
        toast({ title: "Reset link sent!", description: "Check your email for password reset instructions" })
      } else {
        toast({ title: "Error", description: response.error || "Failed to send reset email", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
          <p className="text-gray-600 mb-6">We've sent password reset instructions to your email address.</p>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">Didn't receive the email? Check your spam folder.</p>
            <Button variant="outline" onClick={() => setSuccess(false)} className="w-full">
              Try Again
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Forgot Password?</h1>
          <p className="text-gray-600">Enter your email to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10 h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-blue-600 hover:underline inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  )
}
