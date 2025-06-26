"use client"
import { use, useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Shield, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const { token } = use(params)
  const { toast } = useToast()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }

    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await api.resetPassword(token, password)
      if (response.success) {
        setSuccess(true)
        toast({ title: "Success!", description: "Password reset successfully" })
        setTimeout(() => router.push("/login"), 3000)
      } else {
        toast({ title: "Error", description: response.error || "Password reset failed", variant: "destructive" })
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
          <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
          <p className="text-gray-600 mb-6">Your password has been successfully updated.</p>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">Redirecting to login in 3 seconds...</p>
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">Continue to Login</Button>
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
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-gray-600">Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="pl-10 pr-10 h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-12 px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="pl-10 pr-10 h-12"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-12 px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  )
}
