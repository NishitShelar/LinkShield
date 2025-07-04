"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const [feedback, setFeedback] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [showLoginNotice, setShowLoginNotice] = useState(false)

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined' && !localStorage.getItem("token")) {
      setShowLoginNotice(true)
      setTimeout(() => {
        setShowLoginNotice(false)
        window.location.href = "/login"
      }, 1000)
      return
    }
    if (!feedback.trim()) return
    try {
      const res = await fetch("https://api.linkshld.xyz/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") && { Authorization: `Bearer ${localStorage.getItem("token")}` })
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
    } catch (err) {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl p-8 bg-white/90 rounded-xl shadow-xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Contact Us</h1>
        <p className="mb-4 text-gray-700">
          <strong>LinkShield</strong> is a modern URL shortener focused on security, analytics, and trust. Our aim is to protect users from malicious links, provide deep insights for marketers, and make sharing links safe and beautiful for everyone.
        </p>
        <p className="mb-4 text-gray-700">
          <strong>Our Mission:</strong> To make the web safer and more transparent by combining advanced threat detection, privacy, and analytics in every short link.
        </p>
        <div className="mb-6">
          <span className="font-semibold">Contact Email: </span>
          <a href="mailto:noreply.linkshield@gmail.com" className="text-blue-600 underline">noreply.linkshield@gmail.com</a>
        </div>
        <div className="mb-2">
          <h2 className="text-xl font-semibold mb-2">Send Feedback</h2>
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
      </div>
    </div>
  )
} 