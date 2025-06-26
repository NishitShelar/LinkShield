"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Shield, Mail, Lock } from "lucide-react"
import { GoogleSignIn } from "@/components/google-signin"

export default function LoginPage() {
  const router = useRouter()
  const { login, user, loading } = useAuth()
  const { toast } = useToast()
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  const handleGoogleSuccess = async (idToken: string) => {
    setFormLoading(true)
    try {
      const response = await api.googleAuth(idToken)
      if (response.success) {
        await login(response.data.user, response.data.token)
        toast({ title: "Welcome back!", description: "Successfully signed in with Google" })
        localStorage.setItem("justLoggedIn", "true");
        router.push("/dashboard")
      } else {
        toast({ title: "Error", description: response.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Google sign-in failed", variant: "destructive" })
    }
    setFormLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const response = await api.login(formData)
      if (response.success) {
        await login(response.data.user, response.data.token)
        toast({ title: "Welcome back!", description: "Successfully logged in" })
        localStorage.setItem("justLoggedIn", "true");
        router.replace("/dashboard")
      } else {
        toast({ title: "Error", description: response.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
    setFormLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-10 shadow-2xl border-0 bg-white/90 backdrop-blur-xl rounded-3xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 mb-2">Welcome Back</h1>
          <p className="text-gray-700 text-lg">Sign in to your account</p>
        </div>

        <GoogleSignIn
          onSuccess={handleGoogleSuccess}
          onError={(error) => toast({ title: "Error", description: "Google sign-in failed", variant: "destructive" })}
          text="Continue with Google"
        />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10 h-12"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="pl-10 h-12"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={formLoading}
          >
            {formLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
            Forgot your password?
          </Link>
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
