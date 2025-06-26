"use client"
import { useState } from "react"
import React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Copy, Sparkles, Zap, Shield, BarChart3, ArrowRight } from "lucide-react"

export default function HomePage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [showLoginNotice, setShowLoginNotice] = useState(false)

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    try {
      const response = await api.createLink({ originalUrl: url }, token)
      if (response.success) {
        setShortUrl(`http://localhost:3000/r/${response.data.shortCode}`)
        toast({ title: "Link created!", description: "Your short link is ready" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create link", variant: "destructive" })
    }
    setLoading(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shortUrl)
    toast({ title: "Copied!", description: "Link copied to clipboard" })
  }

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setShowLoginNotice(true)
      setTimeout(() => {
        setShowLoginNotice(false)
        window.location.href = "/login"
      }, 1000)
      return
    }
    if (!feedback.trim()) return
    try {
      const res = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ feedback }),
      })
      if (res.status === 401) {
        setShowLoginNotice(true)
        setTimeout(() => {
          setShowLoginNotice(false)
          window.location.href = "/login"
        }, 1000)
        return
      }
      const data = await res.json()
      if (data.success) {
        setFeedback("")
        setFeedbackSent(true)
        setTimeout(() => setFeedbackSent(false), 3000)
      }
    } catch (err) {
      // Optionally show error toast
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated, emotionally pleasing background - more vibrant */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 animate-gradient-move opacity-90" />
        {/* More visible floating shapes */}
        <div className="absolute top-10 left-10 w-56 h-56 bg-blue-400/40 rounded-full blur-2xl animate-float-slow shadow-2xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float-medium shadow-xl" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-pink-400/40 rounded-full blur-2xl animate-float-fast shadow-lg" style={{transform:'translate(-50%,-50%)'}} />
        {/* Subtle glowing effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-transparent via-white/60 to-transparent opacity-70 mix-blend-lighten animate-pulse-slow" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Beautiful URL Shortening
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Shorten URLs
            <br />
            <span className="text-4xl md:text-6xl">Beautifully</span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Create stunning short links with powerful analytics. Perfect for social media, marketing campaigns, and
            more.
          </p>

          {/* URL Shortener */}
          <Card className="p-8 max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <form onSubmit={handleShorten} className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="url"
                  placeholder="Paste your long URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 h-12 text-lg border-2 focus:border-blue-500"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? "Creating..." : "Shorten"}
                </Button>
              </div>

              {!user && (
                <p className="text-sm text-gray-500">
                  3 free links without account •{" "}
                  <span className="text-blue-600 cursor-pointer">Sign up for unlimited</span>
                </p>
              )}
            </form>

            {shortUrl && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <Input value={shortUrl} readOnly className="flex-1" />
                  <Button onClick={copyLink} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose LinkShield?</h2>
            <p className="text-xl text-gray-600">Powerful features for modern link management</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Lightning Fast</h3>
              <p className="text-gray-600">Instant redirects with global CDN for maximum speed</p>
            </Card>

            <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Advanced Analytics</h3>
              <p className="text-gray-600">Detailed insights on clicks, locations, and performance</p>
            </Card>

            <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Secure & Reliable</h3>
              <p className="text-gray-600">Enterprise-grade security with 99.9% uptime</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands who trust LinkShield for their links</p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Use Cases / Trust Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why LinkShield?</h2>
            <p className="text-xl text-gray-600">Built for trust, analytics, and business growth.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="p-8 border-0 shadow-lg text-center flex flex-col justify-between h-full">
              <h3 className="text-2xl font-bold mb-2">Builds Trust</h3>
              <p className="text-gray-600 mb-4">Every link is scanned for phishing, scam, and malware. Your audience is always protected.</p>
              <Badge className="bg-green-600 text-white text-base px-4 py-2 rounded-full mx-auto">Safe Browsing</Badge>
            </Card>
            <Card className="p-8 border-0 shadow-lg text-center flex flex-col justify-between h-full">
              <h3 className="text-2xl font-bold mb-2">Affiliate Analytics</h3>
              <p className="text-gray-600 mb-4">Track affiliate links, analyze conversions, and optimize your marketing with deep insights.</p>
              <Badge className="bg-yellow-500 text-white text-base px-4 py-2 rounded-full mx-auto">Affiliate Marketers</Badge>
            </Card>
            <Card className="p-8 border-0 shadow-lg text-center flex flex-col justify-between h-full">
              <h3 className="text-2xl font-bold mb-2">Social Media</h3>
              <p className="text-gray-600 mb-4">Share beautiful, branded links on every platform and monitor engagement.</p>
              <Badge className="bg-purple-600 text-white text-base px-4 py-2 rounded-full mx-auto">Influencers</Badge>
            </Card>
            <Card className="p-8 border-0 shadow-lg text-center flex flex-col justify-between h-full">
              <h3 className="text-2xl font-bold mb-2">Business & Teams</h3>
              <p className="text-gray-600 mb-4">Manage links at scale, collaborate securely, and protect your brand reputation.</p>
              <Badge className="bg-pink-600 text-white text-base px-4 py-2 rounded-full mx-auto">Enterprises</Badge>
            </Card>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-12 px-4 bg-white border-t">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">We value your feedback</h2>
          <p className="text-gray-600 mb-4">Let us know how we can improve LinkShield for you.</p>
          <form onSubmit={handleFeedback} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Input
              type="text"
              placeholder="Your feedback..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="flex-1 h-12 text-lg border-2 focus:border-blue-500"
              maxLength={300}
              required
            />
            <Button type="submit" className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Send
            </Button>
          </form>
          {feedbackSent && <div className="mt-3 text-green-600 font-medium">Thank you for your feedback!</div>}
          {showLoginNotice && (
            <div className="mt-3 text-red-600 font-medium">Please login to submit feedback</div>
          )}
        </div>
      </section>

      {/* Footer */}
      
    </div>
  )
}
