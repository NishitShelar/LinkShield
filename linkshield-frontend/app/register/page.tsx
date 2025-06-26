"use client"
import { useState } from "react"
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
import { Shield, Mail, User, Lock } from "lucide-react"
import { GoogleSignIn } from "@/components/google-signin"

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleGoogleSuccess = async (idToken: string) => {
    setLoading(true)
    try {
      const response = await api.googleAuth(idToken)
      if (response.success) {
        login(response.data.user, response.data.token)
        toast({ title: "Welcome!", description: "Successfully signed up with Google" })
        router.push("/dashboard")
      } else {
        toast({ title: "Error", description: response.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Google sign-up failed", variant: "destructive" })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.register(formData)
      if (response.success) {
        toast({ title: "Success!", description: "Check your email to verify your account" })
        router.push("/login")
      } else {
        toast({ title: "Error", description: response.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-gray-600">Join LinkShield today</p>
        </div>

        <GoogleSignIn
          onSuccess={handleGoogleSuccess}
          onError={(error) => toast({ title: "Error", description: "Google sign-up failed", variant: "destructive" })}
          text="Sign up with Google"
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
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                className="pl-10 h-12"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

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
                placeholder="Create a password"
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
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
