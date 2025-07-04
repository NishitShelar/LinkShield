"use client"
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from "react"
import React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Plus, Copy, Trash2, ExternalLink, BarChart3, Calendar, Link2, Users, Sparkles, Shield, TrendingUp, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import FlappyLinkShield from "../../components/flappy-bird"

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth()
  const { toast } = useToast()
  const [links, setLinks] = useState([])
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [shortenLoading, setShortenLoading] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [feedback, setFeedback] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [showLoginNotice, setShowLoginNotice] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)
  const [uniqueVisitors, setUniqueVisitors] = useState(0)
  const [activityLog, setActivityLog] = useState<any[]>([])
  const [now, setNow] = useState(Date.now())
  const prevLinksRef = useRef<any[]>([])

  useEffect(() => {
    if (token) {
      fetchLinks()
      fetchAnalytics()
    }
  }, [token])

  useEffect(() => {
    if (user && token) {
      fetchLinks()
      fetchAnalytics()
    }
  }, [user, token])

  useEffect(() => {
    const justLoggedIn = typeof window !== 'undefined' && localStorage.getItem("justLoggedIn") === "true";
    if (!loading && !user && !justLoggedIn) {
      router.replace("/");
    }
    // Clear the flag after first render
    if (justLoggedIn) {
      localStorage.removeItem("justLoggedIn");
    }
  }, [user, loading, router]);

  useEffect(() => {
    let timeout: any;
    if (loading) {
      timeout = setTimeout(() => setLoadTimeout(true), 5000);
    } else {
      setLoadTimeout(false);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  // Poll for new links every 15s
  useEffect(() => {
    if (!token) return;
    let interval = setInterval(() => {
      fetchLinks()
    }, 15000)
    return () => clearInterval(interval)
  }, [token])

  // Live time-ago update every 10s
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000)
    return () => clearInterval(interval)
  }, [])

  // Build activity log from links
  useEffect(() => {
    if (!user) return;
    let log: any[] = []
    // Signed in event
    log.push({ type: "signin", time: user.createdAt || user.lastLogin || user.updatedAt || new Date(), user })
    // Compare previous and current links for new links/clicks
    const prevLinks = prevLinksRef.current
    const linkMap: Record<string, any> = {}
    links.forEach((l: any) => (linkMap[l._id] = l))
    // New links
    links.forEach((link: any) => {
      if (!prevLinks.find((pl: any) => pl._id === link._id)) {
        log.push({ type: "newlink", time: link.createdAt, link })
      }
    })
    // Clicks
    links.forEach((link: any) => {
      const prev = prevLinks.find((pl: any) => pl._id === link._id)
      const prevClicks = prev?.analytics?.totalClicks || 0
      const nowClicks = link.analytics?.totalClicks || 0
      if (nowClicks > prevClicks) {
        log.push({ type: "clicks", time: link.updatedAt || link.analytics?.lastClicked || link.createdAt, link, count: nowClicks - prevClicks })
      }
    })
    // Sort log by time desc
    log = log.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    setActivityLog(log)
    prevLinksRef.current = links
  }, [links, user, now])

  // Helper for time ago
  function timeAgo(date: string | number | Date) {
    const d = new Date(date)
    const diff = Math.floor((now - d.getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
    return d.toLocaleDateString()
  }

  const fetchLinks = async () => {
    try {
      const response = await api.getLinks(token)
      if (response.success) {
        setLinks(response.data)
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch links", variant: "destructive" })
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await api.getUserAnalytics(token)
      if (response.success) {
        setAnalytics(response.data)
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch analytics", variant: "destructive" })
    }
  }

  // Calculate unique visitors from links
  useEffect(() => {
    if (links && links.length > 0) {
      const totalUnique = links.reduce((sum: number, link: any) => sum + (link.analytics?.uniqueVisitors || 0), 0)
      setUniqueVisitors(totalUnique)
    } else {
      setUniqueVisitors(0)
    }
  }, [links])

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    setShortenLoading(true)
    try {
      const response = await api.createLink({ originalUrl: url }, token)
      if (response.success) {
        setShortUrl(`https://linkshld.xyz/r/${response.data.shortCode}`)
        toast({ title: "Link created!", description: "Your short link is ready" })
        setUrl("")
        fetchLinks()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create link", variant: "destructive" })
    }
    setShortenLoading(false)
  }

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({ title: "Copied!", description: "Link copied to clipboard" })
  }

  const deleteLink = async (id: string) => {
    try {
      await api.deleteLink(id, token)
      toast({ title: "Deleted", description: "Link deleted successfully" })
      fetchLinks()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete link", variant: "destructive" })
    }
  }

  // Sort links by creation date descending (newest first)
  const sortedLinks = [...links].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
      const res = await fetch("https://api.linkshld.xyz/api/feedback", {
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
    } catch (err) { }
  }

  if (loading) {
    if (loadTimeout) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
          <div className="mb-6 text-2xl font-bold text-red-600">Failed to load dashboard. Please try again.</div>
          <button
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid shadow-lg"></div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 mb-2 drop-shadow-lg">
            Welcome{user && user.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-lg text-gray-700 mb-2">Create, manage, and track your short links with advanced analytics.</p>
          <p className="text-gray-500">Easily shorten URLs, monitor performance, and share your links anywhere.</p>
          </div>
        {/* Link Shortener Tool */}
        <Card className="p-8 max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-10">
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
                disabled={shortenLoading}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {shortenLoading ? "Creating..." : "Shorten"}
              </Button>
                </div>
          </form>
          {shortUrl && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Input value={shortUrl} readOnly className="flex-1" />
                <Button onClick={() => copyLink(shortUrl)} variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
        </div>
          )}
        </Card>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="p-6 flex flex-col items-center bg-white/80 shadow-xl border-0">
            <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-700">{analytics?.totalClicks ?? 0}</div>
            <div className="text-gray-600">Total Clicks</div>
          </Card>
          <Card className="p-6 flex flex-col items-center bg-white/80 shadow-xl border-0">
            <Link2 className="w-8 h-8 text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-purple-700">{analytics?.totalLinks ?? 0}</div>
            <div className="text-gray-600">Links Created</div>
          </Card>
          <Card className="p-6 flex flex-col items-center bg-white/80 shadow-xl border-0">
            <Users className="w-8 h-8 text-pink-600 mb-2" />
            <div className="text-2xl font-bold text-pink-700">{uniqueVisitors}</div>
            <div className="text-gray-600">Unique Visitors</div>
          </Card>
        </div>

        {/* Recent Links & Flappy Bird Mini-Game */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Recent Links Section (vertical, 4 fully visible, extra height) */}
          <Card className="p-6 bg-white/90 shadow-lg border-0 flex flex-col items-center justify-center min-h-[520px] sm:min-h-[320px] max-h-[520px]" style={{ minHeight: '520px', maxHeight: '520px' }}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Link2 className="w-6 h-6 text-purple-500" /> Recent Links
            </h2>
            {links.length === 0 ? (
              <div className="text-gray-500">No links yet. Start by creating your first short link above!</div>
            ) : (
              <div className="space-y-4 overflow-y-auto w-full" style={{ maxHeight: '380px' }}>
                {links.map((link: any) => (
                  <div key={link._id || link.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{link.title || link.shortCode}</h3>
                        <Badge variant={link.status === "active" ? "default" : "secondary"}>
                          {link.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate max-w-xs cursor-pointer" style={{ maxWidth: '220px' }}>{link.originalUrl}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {(link.analytics?.totalClicks || 0)} clicks
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {link.createdAt ? new Date(link.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => copyLink(`https://linkshld.xyz/r/${link.shortCode}`)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={link.originalUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Flappy Bird Mini-Game (Help LinkShield) with buffer below, extra height */}
          <Card className="p-6 bg-white/90 shadow-lg border-0 flex flex-col items-center justify-center min-h-[520px] sm:min-h-[320px] max-h-[520px]">
            <div className="w-full flex-1 flex items-center justify-center">
              <FlappyLinkShield />
            </div>
            {/* Buffer area for Try Again or manual entry */}
            <div className="w-full mt-4 flex flex-col items-center gap-2">
              {/* Example: Try Again button (can be customized as needed) */}
              {/* <Button className="w-32" onClick={...}>Try Again</Button> */}
              {/* <Input className="w-full max-w-xs" placeholder="Manual entry..." /> */}
            </div>
          </Card>
        </div>

        {/* Feedback Section */}
        <div className="mt-12 max-w-xl mx-auto text-center">
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
      </div>
    </div>
  )
}
