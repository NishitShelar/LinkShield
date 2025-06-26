"use client"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function RedirectPage({ params }: { params: { shortCode: string } }) {
  const { shortCode } = params
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer)
          window.location.href = `http://localhost:5000/r/${shortCode}`
                return 0
              }
              return prev - 1
            })
          }, 1000)
    return () => clearInterval(timer)
  }, [shortCode])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <Shield className="w-12 h-12 mx-auto text-blue-600 animate-pulse" />
        </div>
          <div>
            <h1 className="text-xl font-bold mb-2">Redirecting...</h1>
            <p className="text-gray-600 mb-4">You'll be redirected in {countdown} seconds</p>
          <Button onClick={() => (window.location.href = `http://localhost:5000/r/${shortCode}`)} className="w-full">
              Continue Now
            </Button>
          </div>
        <p className="text-xs text-gray-400 mt-6">Protected by LinkShield</p>
      </Card>
    </div>
  )
}
