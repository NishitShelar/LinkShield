"use client"
import React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BarChart3, Users, Link2, LogOut, Globe, Trash2, Eye, TrendingUp, MapPin, Monitor, Smartphone, Calendar, Activity, Target, Shield, Zap, X, Info } from "lucide-react"
import { api } from "@/lib/api"
import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from '@/components/ui/pagination'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Toast, ToastProvider, ToastTitle, ToastDescription, ToastClose } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toaster'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import dynamic from 'next/dynamic'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1']

// Country coordinates for markers - more precise locations
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  "United States": [39.8283, -98.5795],
  "Canada": [56.1304, -106.3468],
  "United Kingdom": [55.3781, -3.4360],
  "Germany": [51.1657, 10.4515],
  "France": [46.2276, 2.2137],
  "Spain": [40.4637, -3.7492],
  "Italy": [41.8719, 12.5674],
  "Russia": [61.5240, 105.3188],
  "China": [35.8617, 104.1954],
  "Japan": [36.2048, 138.2529],
  "India": [20.5937, 78.9629],
  "Australia": [-25.2744, 133.7751],
  "Brazil": [-14.2350, -51.9253],
  "Mexico": [23.6345, -102.5528],
  "Argentina": [-38.4161, -63.6167],
  "South Africa": [-30.5595, 22.9375],
  "Nigeria": [9.0820, 8.6753],
  "Egypt": [26.8206, 30.8025],
  "Turkey": [38.9637, 35.2433],
  "Iran": [32.4279, 53.6880],
  "Saudi Arabia": [23.8859, 45.0792],
  "Pakistan": [30.3753, 69.3451],
  "Indonesia": [-0.7893, 113.9213],
  "Thailand": [15.8700, 100.9925],
  "Vietnam": [14.0583, 108.2772],
  "Malaysia": [4.2105, 108.9758],
  "Philippines": [12.8797, 121.7740],
  "South Korea": [35.9078, 127.7669],
  "North Korea": [40.3399, 127.5101],
  "Mongolia": [46.8625, 103.8467],
  "Kazakhstan": [48.0196, 66.9237],
  "Ukraine": [48.3794, 31.1656],
  "Poland": [51.9194, 19.1451],
  "Netherlands": [52.1326, 5.2913],
  "Belgium": [50.8503, 4.3517],
  "Switzerland": [46.8182, 8.2275],
  "Austria": [47.5162, 14.5501],
  "Czech Republic": [49.8175, 15.4730],
  "Hungary": [47.1625, 19.5033],
  "Romania": [45.9432, 24.9668],
  "Bulgaria": [42.7339, 25.4858],
  "Greece": [39.0742, 21.8243],
  "Portugal": [39.3999, -8.2245],
  "Ireland": [53.4129, -8.2439],
  "Norway": [60.4720, 8.4689],
  "Sweden": [60.1282, 18.6435],
  "Finland": [61.9241, 25.7482],
  "Denmark": [56.2639, 9.5018],
  "Iceland": [64.9631, -19.0208],
  "New Zealand": [-40.9006, 174.8860],
  "Chile": [-35.6751, -71.5430],
  "Peru": [-9.1900, -75.0152],
  "Colombia": [4.5709, -74.2973],
  "Venezuela": [6.4238, -66.5897],
  "Ecuador": [-1.8312, -78.1834],
  "Bolivia": [-16.2902, -63.5887],
  "Paraguay": [-23.4425, -58.4438],
  "Uruguay": [-32.5228, -55.7658],
  "Guyana": [4.8604, -58.9302],
  "Suriname": [3.9193, -56.0278],
  "French Guiana": [3.9339, -53.1258]
}

// Function to get coordinates for a location (country + city)
const getLocationCoordinates = (country: string, city?: string): [number, number] | null => {
  // If we have the country in our coordinates, use it as base
  const countryCoords = COUNTRY_COORDINATES[country]
  if (!countryCoords) return null
  
  // For now, return country coordinates
  // In a real implementation, you could use a geocoding service like:
  // - Google Maps Geocoding API
  // - OpenStreetMap Nominatim
  // - Here Maps Geocoding API
  return countryCoords
}

// Function to get precise coordinates from click data
const getCoordinatesFromClickData = (clickData: any): [number, number] | null => {
  if (clickData.location?.lat && clickData.location?.lon) {
    return [clickData.location.lat, clickData.location.lon]
  }
  return null
}

// Function to get precise coordinates from IP (would need backend integration)
const getCoordinatesFromIP = async (ipAddress: string): Promise<[number, number] | null> => {
  try {
    // This would typically call your backend which uses a geolocation service
    // For now, we'll return null and use country-based coordinates
    return null
  } catch (error) {
    console.error('Error getting coordinates from IP:', error)
    return null
  }
}

// Dynamic import for Leaflet map to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
})

// Interactive Map Component
const InteractiveMap = ({ 
  countryData, 
  highlightLocation,
  preciseCoordinates 
}: { 
  countryData: Array<{ name: string; value: number }>
  highlightLocation?: { country: string; city?: string; ip?: string } | null
  preciseCoordinates?: [number, number] | null
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [highlightedCoords, setHighlightedCoords] = useState<[number, number] | null>(null)

  // Create markers data for the map
  const markers = countryData
    .filter(country => COUNTRY_COORDINATES[country.name])
    .map(country => ({
      name: country.name,
      clicks: country.value,
      coordinates: COUNTRY_COORDINATES[country.name] as [number, number]
    }))

  const maxClicks = Math.max(...countryData.map(c => c.value), 1)

  // Handle highlighting specific location
  useEffect(() => {
    if (preciseCoordinates) {
      // Use precise coordinates if available
      setHighlightedCoords(preciseCoordinates)
      setSelectedCountry(highlightLocation?.country || null)
    } else if (highlightLocation) {
      // Fall back to country coordinates
      const coords = getLocationCoordinates(highlightLocation.country, highlightLocation.city)
      setHighlightedCoords(coords)
      setSelectedCountry(highlightLocation.country)
    }
  }, [highlightLocation, preciseCoordinates])

  return (
    <div className="relative">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Interactive World Map</h3>
        <div className="text-sm text-gray-600">
          {selectedCountry && (
            <span>Selected: {selectedCountry}</span>
          )}
        </div>
      </div>
      
      <div className="relative bg-white border rounded-lg overflow-hidden">
        <LeafletMap 
          markers={markers} 
          maxClicks={maxClicks}
          onMarkerClick={setSelectedCountry}
          highlightLocation={highlightedCoords}
        />
        
        {/* Selected country details */}
        {selectedCountry && (
          <div className="p-4 bg-blue-50 border-t border-blue-200">
            <h4 className="font-semibold text-blue-800">{selectedCountry}</h4>
            <p className="text-blue-600">
              Total Clicks: <span className="font-bold">
                {countryData.find(c => c.name === selectedCountry)?.value || 0}
              </span>
            </p>
            <p className="text-sm text-blue-500">
              Percentage: <span className="font-bold">
                {((countryData.find(c => c.name === selectedCountry)?.value || 0) / maxClicks * 100).toFixed(1)}%
              </span> of total
            </p>
            {highlightLocation && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <p className="text-sm text-blue-600">
                  <strong>Highlighted:</strong> {highlightLocation.city || highlightLocation.country}
                  {highlightLocation.ip && (
                    <span className="ml-2 text-xs text-blue-500">({highlightLocation.ip})</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PowerAdminPage() {
  const [step, setStep] = useState<'login' | 'dashboard'>('login')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [tab, setTab] = useState('dashboard')

  // Dashboard data
  const [dashboard, setDashboard] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  
  // Users
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  
  // Links
  const [links, setLinks] = useState<any[]>([])
  const [selectedLink, setSelectedLink] = useState<any | null>(null)
  const [linkAnalytics, setLinkAnalytics] = useState<any | null>(null)
  const [linkClicks, setLinkClicks] = useState<any[]>([])

  // Add state for recent activity
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Add state for pagination and sorting
  const [userPage, setUserPage] = useState(1)
  const [userRowsPerPage] = useState(10)
  const [userSort, setUserSort] = useState<'name' | 'email' | 'role' | 'createdAt'>('createdAt')
  const [userSortDir, setUserSortDir] = useState<'asc' | 'desc'>('desc')
  const [linkPage, setLinkPage] = useState(1)
  const [linkRowsPerPage] = useState(10)
  const [linkSort, setLinkSort] = useState<'shortCode' | 'originalUrl' | 'createdAt'>('createdAt')
  const [linkSortDir, setLinkSortDir] = useState<'asc' | 'desc'>('desc')

  // Add state for click analytics table sorting and pagination
  const [clickPage, setClickPage] = useState(1)
  const [clickRowsPerPage] = useState(10)
  const [clickSort, setClickSort] = useState<'createdAt' | 'country' | 'city' | 'device' | 'browser' | 'os'>('createdAt')
  const [clickSortDir, setClickSortDir] = useState<'asc' | 'desc'>('desc')

  // Add state for loading and toast
  const [usersLoading, setUsersLoading] = useState(false)
  const [linksLoading, setLinksLoading] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  // Time range for analytics
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Add state for map highlighting
  const [mapHighlightLocation, setMapHighlightLocation] = useState<{ country: string; city?: string; ip?: string } | null>(null)
  const [mapPreciseCoordinates, setMapPreciseCoordinates] = useState<[number, number] | null>(null)
  const [showMapModal, setShowMapModal] = useState(false)

  // Add state for feedbacks
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null);

  // Monitor tab changes and auto-scroll to map
  useEffect(() => {
    if (tab === 'analytics' && mapHighlightLocation) {
      const timer = setTimeout(() => {
        const mapSection = document.querySelector('[data-map-section]')
        if (mapSection) {
          mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [tab, mapHighlightLocation])

  // Login logic
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api.login({ email, password })
      if (res.success && res.data && res.data.role === "admin") {
        setToken(res.data.token)
        setStep('dashboard')
      } else {
        setError("Invalid admin credentials")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    }
    setLoading(false)
  }

  // Fetch dashboard/users/links/feedbacks on login
  useEffect(() => {
    if (step === 'dashboard' && token) {
      setDashboardLoading(true)
      setUsersLoading(true)
      setLinksLoading(true)
      setFeedbacksLoading(true)
      // Fetch all data
      Promise.all([
        api.getAdminDashboard(token),
        api.getAdminUsers(token),
        api.getAdminLinks(token),
        api.getUserAnalytics(token),
        fetch('https://api.linkshld.xyz/api/admin/feedback', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json())
      ]).then(([dashboardRes, usersRes, linksRes, analyticsRes, feedbackRes]) => {
        setDashboardLoading(false)
        setUsersLoading(false)
        setLinksLoading(false)
        setFeedbacksLoading(false)
        
        if (dashboardRes.success) {
          setDashboard(dashboardRes.data)
        }
        
        if (usersRes.success) {
          setUsers(usersRes.data)
        }
        
        if (linksRes.success) {
          setLinks(linksRes.data)
        }
        
        if (analyticsRes.success) {
          setAnalytics(analyticsRes.data)
        }
        
        if (feedbackRes.success) {
          setFeedbacks(feedbackRes.data)
        }
        
        // Generate recent activity
        if (usersRes.success && linksRes.success) {
          const recentUsers = usersRes.data.slice(0, 5).map((u: any) => ({
            type: 'user',
            date: u.createdAt,
            name: u.name,
            email: u.email
          }))
          const recentLinks = linksRes.data.slice(0, 5).map((l: any, idx: number) => ({
            type: 'link',
            date: l.createdAt,
            shortCode: l.shortCode,
            url: l.originalUrl,
            title: l.title || `link-${(idx+1).toString().padStart(3, '0')}`
          }))
          setRecentActivity([...recentUsers, ...recentLinks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10))
        }
      }).catch(error => {
        console.error('Error fetching admin data:', error)
        setError('Failed to load admin data. Please try again.')
        setDashboardLoading(false)
        setUsersLoading(false)
        setLinksLoading(false)
        setFeedbacksLoading(false)
      })
    }
  }, [step, token])

  // User details
  const openUser = async (user: any) => {
    if (!token) return
    const res = await api.getAdminUser(user._id || user.id, token)
    if (res.success) setSelectedUser(res.data)
  }
  const closeUser = () => setSelectedUser(null)
  const handleDeleteUser = async (user: any) => {
    if (!token) return
    if (!window.confirm(`Delete user ${user.email}?`)) return
    try {
      await api.deleteAdminUser(user._id || user.id, token)
      setUsers(users.filter(u => (u._id || u.id) !== (user._id || user.id)))
      setToastMsg('User deleted successfully')
      setToastType('success')
    } catch (err) {
      setToastMsg('Failed to delete user')
      setToastType('error')
    }
    closeUser()
  }

  // Link details
  const openLink = async (link: any) => {
    if (!token) return
    const res = await api.getAdminLink(link._id || link.id, token)
    if (res.success) setSelectedLink(res.data)
    const analyticsRes = await api.getLinkAnalytics(link._id || link.id, token)
    if (analyticsRes.success) setLinkAnalytics(analyticsRes.data)
    const clicksRes = await api.getAdminLinkClicks(link._id || link.id, token)
    if (clicksRes.success) setLinkClicks(clicksRes.data)
  }
  const closeLink = () => { setSelectedLink(null); setLinkAnalytics(null); setLinkClicks([]) }
  const handleDeleteLink = async (link: any) => {
    if (!token) return
    if (!window.confirm(`Delete link ${link.shortCode}?`)) return
    try {
      await api.deleteAdminLink(link._id || link.id, token)
      setLinks(links.filter(l => (l._id || l.id) !== (link._id || link.id)))
      setToastMsg('Link deleted successfully')
      setToastType('success')
    } catch (err) {
      setToastMsg('Failed to delete link')
      setToastType('error')
    }
    closeLink()
  }

  const handleLogout = () => {
    setStep('login')
    setEmail("")
    setPassword("")
    setError("")
    setToken(null)
    setDashboard(null)
    setUsers([])
    setLinks([])
    setSelectedUser(null)
    setSelectedLink(null)
    setLinkAnalytics(null)
  }

  // Sort and paginate users
  const sortedUsers = [...users].sort((a, b) => {
    let valA = a[userSort] || ''
    let valB = b[userSort] || ''
    if (userSort === 'createdAt') {
      valA = new Date(valA).getTime()
      valB = new Date(valB).getTime()
    }
    if (valA < valB) return userSortDir === 'asc' ? -1 : 1
    if (valA > valB) return userSortDir === 'asc' ? 1 : -1
    return 0
  })
  const pagedUsers = sortedUsers.slice((userPage - 1) * userRowsPerPage, userPage * userRowsPerPage)

  // Sort and paginate links
  const sortedLinks = [...links].sort((a, b) => {
    let valA = a[linkSort] || ''
    let valB = b[linkSort] || ''
    if (linkSort === 'createdAt') {
      valA = new Date(valA).getTime()
      valB = new Date(valB).getTime()
    }
    if (valA < valB) return linkSortDir === 'asc' ? -1 : 1
    if (valA > valB) return linkSortDir === 'asc' ? 1 : -1
    return 0
  })
  const pagedLinks = sortedLinks.slice((linkPage - 1) * linkRowsPerPage, linkPage * linkRowsPerPage)

  // Sort and paginate clicks
  const sortedClicks = [...linkClicks].sort((a, b) => {
    let valA = a[clickSort] || ''
    let valB = b[clickSort] || ''
    if (clickSort === 'createdAt') {
      valA = new Date(a.createdAt).getTime()
      valB = new Date(b.createdAt).getTime()
    } else if (clickSort === 'country') {
      valA = a.location?.country || ''
      valB = b.location?.country || ''
    } else if (clickSort === 'city') {
      valA = a.location?.city || ''
      valB = b.location?.city || ''
    } else if (clickSort === 'device') {
      valA = a.device?.type || ''
      valB = b.device?.type || ''
    } else if (clickSort === 'browser') {
      valA = a.device?.browser || ''
      valB = b.device?.browser || ''
    } else if (clickSort === 'os') {
      valA = a.device?.os || ''
      valB = b.device?.os || ''
    }
    if (valA < valB) return clickSortDir === 'asc' ? -1 : 1
    if (valA > valB) return clickSortDir === 'asc' ? 1 : -1
    return 0
  })
  const pagedClicks = sortedClicks.slice((clickPage - 1) * clickRowsPerPage, clickPage * clickRowsPerPage)

  // Analytics calculations
  const totalClicks = links.reduce((sum, link) => sum + (link.analytics?.totalClicks || 0), 0)
  const totalUniqueVisitors = links.reduce((sum, link) => sum + (link.analytics?.uniqueVisitors || 0), 0)
  const activeLinks = links.filter(link => link.status === 'active').length
  const flaggedLinks = links.filter(link => link.safetyStatus?.isSafe === false).length
  const verifiedUsers = users.filter(user => user.isVerified).length
  const premiumUsers = users.filter(user => (user.subscriptionPlan || user.subscription?.plan) !== 'free').length

  // Device breakdown
  const deviceBreakdown = linkClicks.reduce((acc, click) => {
    const deviceType = click.device?.type || 'unknown'
    acc[deviceType] = (acc[deviceType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Browser breakdown
  const browserBreakdown = linkClicks.reduce((acc, click) => {
    const browser = click.device?.browser || 'unknown'
    acc[browser] = (acc[browser] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Country breakdown - use dashboard data if available, otherwise use linkClicks
  const countryBreakdown = dashboard?.topCountries ? 
    dashboard.topCountries.reduce((acc: Record<string, number>, country: any) => {
      acc[country._id] = Number(country.count) || 0
      return acc
    }, {}) :
    linkClicks.reduce((acc, click) => {
      const country = click.location?.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  // Process dashboard data for charts
  const deviceChartData = dashboard?.topDevices?.map((device: any) => ({
    name: device._id || device.device || 'Unknown',
    value: device.count || 0
  })) || []

  const browserChartData = dashboard?.topBrowsers?.map((browser: any) => ({
    name: browser._id || browser.browser || 'Unknown',
    value: browser.count || 0
  })) || []

  const countryChartData = dashboard?.topCountries?.map((country: any) => ({
    name: country._id || country.country || 'Unknown',
    value: country.count || 0
  })) || []

  // Fallback sample data for testing if no real data
  const sampleCountryData = [
    { name: "United States", value: 150 },
    { name: "United Kingdom", value: 85 },
    { name: "Germany", value: 65 },
    { name: "Canada", value: 45 },
    { name: "Australia", value: 35 },
    { name: "France", value: 30 },
    { name: "India", value: 25 },
    { name: "Brazil", value: 20 }
  ]
  
  const finalCountryChartData = countryChartData.length > 0 ? countryChartData : sampleCountryData

  // Debug useEffect to monitor country data
  useEffect(() => {
    console.log('🔍 Country chart data changed:', finalCountryChartData.length, 'items')
  }, [finalCountryChartData])

  // Function to handle location click in link details
  const handleLocationClick = (country: string, city?: string, ip?: string) => {
    // Close the link details modal first
    closeLink()
    
    // Set the highlight location first
    setMapHighlightLocation({ country, city, ip })
    
    // Try to find precise coordinates from click data
    let preciseCoords: [number, number] | null = null
    if (ip) {
      // Find the click data for this IP
      const clickData = linkClicks.find((click: any) => click.ipAddress === ip)
      if (clickData) {
        preciseCoords = getCoordinatesFromClickData(clickData)
      }
    }
    
    // Set precise coordinates
    setMapPreciseCoordinates(preciseCoords)
    setShowMapModal(true)
    
    // Switch to analytics tab
    setTimeout(() => {
      setTab('analytics')
    }, 50)
  }

  // Filter out admin users from users list
  const filteredUsers = users.filter((u: any) => u.role !== 'admin');
  const filteredPagedUsers = pagedUsers.filter((u: any) => u.role !== 'admin');
  const filteredRecentActivity = recentActivity.filter((item: any) => !(item.type === 'user' && item.role === 'admin'));

  return (
    <ToastProvider>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-7xl p-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            {step === 'login' && (
              <form onSubmit={handleLogin} className="max-w-sm mx-auto space-y-6">
                <div className="text-center mb-6">
                  <BarChart3 className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                  <h1 className="text-2xl font-bold mb-2">Power Admin Panel</h1>
                  <p className="text-gray-600">Sign in with admin credentials</p>
                </div>
                <Input
                  type="email"
                  placeholder="Admin Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}
            {step === 'dashboard' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-2xl font-bold">Power Admin Panel</h1>
                    <p className="text-gray-600">Welcome, Admin! Manage users, links, and analytics below.</p>
                  </div>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </div>
                <Tabs value={tab} onValueChange={setTab} className="mb-6">
                  <TabsList>
                    <TabsTrigger value="dashboard"><BarChart3 className="w-4 h-4 mr-1" /> Dashboard</TabsTrigger>
                    <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" /> Users</TabsTrigger>
                    <TabsTrigger value="links"><Link2 className="w-4 h-4 mr-1" /> Links</TabsTrigger>
                    <TabsTrigger value="analytics"><TrendingUp className="w-4 h-4 mr-1" /> Analytics</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dashboard">
                    <div className="space-y-8">
                      {/* Main Stats Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm opacity-90">Total Users</p>
                              <p className="text-3xl font-bold">{users.length}</p>
                            </div>
                            <Users className="w-8 h-8 opacity-80" />
                          </div>
                        </Card>
                        <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm opacity-90">Total Links</p>
                              <p className="text-3xl font-bold">{links.length}</p>
                            </div>
                            <Link2 className="w-8 h-8 opacity-80" />
                          </div>
                        </Card>
                        <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm opacity-90">Total Clicks</p>
                              <p className="text-3xl font-bold">{totalClicks}</p>
                            </div>
                            <Target className="w-8 h-8 opacity-80" />
                          </div>
                        </Card>
                        <Card className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm opacity-90">Flagged Links</p>
                              <p className="text-3xl font-bold">{flaggedLinks}</p>
                      </div>
                            <Shield className="w-8 h-8 opacity-80" />
                          </div>
                        </Card>
                      </div>

                      {/* Secondary Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Active Links</p>
                            <p className="text-2xl font-bold text-green-600">{activeLinks}</p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Unique Visitors</p>
                            <p className="text-2xl font-bold text-blue-600">{totalUniqueVisitors}</p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Verified Users</p>
                            <p className="text-2xl font-bold text-purple-600">{verifiedUsers}</p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Premium Users</p>
                            <p className="text-2xl font-bold text-orange-600">{premiumUsers}</p>
                          </div>
                        </Card>
                      </div>

                      {/* Charts Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Clicks Over Time */}
                    {dashboard && dashboard.clicksByDate && (
                          <Card className="p-6">
                            <h3 className="font-bold mb-4 text-gray-800">Clicks Over Time</h3>
                            <ResponsiveContainer width="100%" height={300}>
                              <AreaChart data={dashboard.clicksByDate}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <RechartsTooltip />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </Card>
                        )}

                        {/* Top Countries */}
                        {dashboard && dashboard.topCountries && (
                          <Card className="p-6">
                            <h3 className="font-bold mb-4 text-gray-800">Top Countries</h3>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={dashboard.topCountries.slice(0, 8)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="count" fill="#8884d8" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Card>
                    )}
                      </div>

                      {/* Device & Browser Quick Stats */}
                      {deviceChartData.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <Card className="p-6">
                            <h3 className="font-bold mb-4 text-gray-800">Device Types</h3>
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={deviceChartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {deviceChartData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </Card>

                          <Card className="p-6">
                            <h3 className="font-bold mb-4 text-gray-800">Browser Usage</h3>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={browserChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="value" fill="#82ca9d" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Card>
                        </div>
                      )}

                      {/* Recent Activity */}
                      <Card className="p-6">
                        <h3 className="font-bold mb-4 text-gray-800">Recent Activity</h3>
                        <div className="space-y-3">
                          {filteredRecentActivity.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No recent activity</p>
                          ) : (
                            filteredRecentActivity.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                {item.type === 'user' ? (
                                  <Users className="w-5 h-5 text-blue-500" />
                                ) : (
                                  <Link2 className="w-5 h-5 text-purple-500" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {item.type === 'user' 
                                      ? `User ${item.name} (${item.email}) joined` 
                                      : `Link ${item.shortCode} created`
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(item.date).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="users">
                    <h2 className="text-xl font-bold mb-4">All Users ({users.length})</h2>
                    {usersLoading ? (
                      <div className="text-center py-8">
                        <Skeleton className="h-8 w-full mb-2" />
                        <Skeleton className="h-8 w-full mb-2" />
                        <Skeleton className="h-8 w-full mb-2" />
                      </div>
                    ) : users.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No users found</p>
                        <p className="text-sm text-gray-400">Users will appear here once they register</p>
                      </div>
                    ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-blue-50">
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Email</th>
                            <th className="p-2 text-left">Role</th>
                              <th className="p-2 text-left">Verified</th>
                              <th className="p-2 text-left">Plan</th>
                              <th className="p-2 text-left">Last Active</th>
                            <th className="p-2 text-left">Joined</th>
                            <th className="p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                            {filteredPagedUsers.map(user => (
                            <tr key={user._id || user.id} className="border-b hover:bg-blue-100 cursor-pointer" onClick={() => openUser(user)}>
                              <td className="p-2 font-medium">{user.name}</td>
                              <td className="p-2">{user.email}</td>
                              <td className="p-2"><Badge>{user.role}</Badge></td>
                                <td className="p-2">
                                  <Badge variant={user.isVerified ? "default" : "destructive"}>
                                    {user.isVerified ? "Yes" : "No"}
                                  </Badge>
                                </td>
                                <td className="p-2">
                                  <Badge variant="outline">
                                    {user.subscriptionPlan || user.subscription?.plan || "free"}
                                  </Badge>
                                </td>
                                <td className="p-2">
                                  {user.lastActive ? (
                                    <span className="text-xs">
                                      {new Date(user.lastActive).toLocaleDateString()}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-xs">Never</span>
                                  )}
                                </td>
                              <td className="p-2">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}</td>
                              <td className="p-2 flex gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); openUser(user) }}><Eye className="w-4 h-4" /></Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View details</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); handleDeleteUser(user) }}><Trash2 className="w-4 h-4" /></Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete user</TooltipContent>
                                </Tooltip>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    )}
                  </TabsContent>

                  <TabsContent value="links">
                    <h2 className="text-xl font-bold mb-4">All Links ({links.length})</h2>
                    {linksLoading ? (
                      <div className="text-center py-8">
                        <Skeleton className="h-8 w-full mb-2" />
                        <Skeleton className="h-8 w-full mb-2" />
                        <Skeleton className="h-8 w-full mb-2" />
                      </div>
                    ) : links.length === 0 ? (
                      <div className="text-center py-8">
                        <Link2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No links found</p>
                        <p className="text-sm text-gray-400">Links will appear here once they are created</p>
                      </div>
                    ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-purple-50">
                            <th className="p-2 text-left">Short Code</th>
                            <th className="p-2 text-left">Original URL</th>
                            <th className="p-2 text-left">Clicks</th>
                            <th className="p-2 text-left">User</th>
                              <th className="p-2 text-left">Status</th>
                              <th className="p-2 text-left">Safety</th>
                              <th className="p-2 text-left">Expires</th>
                            <th className="p-2 text-left">Created</th>
                            <th className="p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                            {pagedLinks.map((link: any, idx: number) => (
                            <tr key={link._id || link.id} className="border-b hover:bg-purple-100 cursor-pointer" onClick={() => openLink(link)}>
                              <td className="p-2 font-mono">{link.shortCode}</td>
                              <td className="p-2 truncate max-w-xs">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-sm text-gray-600 truncate max-w-xs cursor-pointer" style={{maxWidth:'320px'}}>{link.originalUrl}</p>
                                  </TooltipTrigger>
                                  <TooltipContent>{link.originalUrl}</TooltipContent>
                                </Tooltip>
                              </td>
                                <td className="p-2">
                                  {(() => {
                                    const clickCount = link.analytics?.totalClicks || link.totalClicks || 0;
                                    console.log(`Link ${link.shortCode} clicks:`, clickCount, 'from:', link.analytics);
                                    return clickCount;
                                  })()}
                                </td>
                              <td className="p-2">{link.user?.name || "-"}</td>
                                <td className="p-2">
                                  <Badge variant={link.status === 'active' ? "default" : "destructive"}>
                                    {link.status}
                                  </Badge>
                                </td>
                                <td className="p-2">
                                  <Badge variant={link.safetyStatus?.isSafe ? "default" : "destructive"}>
                                    {link.safetyStatus?.isSafe ? "Safe" : "Unsafe"}
                                  </Badge>
                                </td>
                                <td className="p-2">
                                  {link.expiresAt ? (
                                    <span className={new Date(link.expiresAt) < new Date() ? "text-red-600" : "text-gray-600"}>
                                      {new Date(link.expiresAt).toLocaleDateString()}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">Never</span>
                                  )}
                                </td>
                              <td className="p-2">{link.createdAt ? new Date(link.createdAt).toLocaleDateString() : ""}</td>
                              <td className="p-2 flex gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); openLink(link) }}><Eye className="w-4 h-4" /></Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View details</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); handleDeleteLink(link) }}><Trash2 className="w-4 h-4" /></Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete link</TooltipContent>
                                </Tooltip>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="analytics">
                    <div className="space-y-8">
                      {/* Analytics Header */}
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Detailed Analytics</h2>
                        <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d') => setTimeRange(value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Geographic Analytics */}
                      <Card className="p-6">
                        <h3 className="font-bold mb-4 text-gray-800">Geographic Distribution</h3>
                        {finalCountryChartData.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={finalCountryChartData.slice(0, 8)}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {finalCountryChartData.slice(0, 8).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2">
                              <h4 className="font-semibold">Top Countries</h4>
                              {finalCountryChartData.slice(0, 10).map((country: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span className="text-sm">{country.name}</span>
                                  <Badge variant="outline">{country.value} clicks</Badge>
                                </div>
                            ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400">No geographic data available</div>
                        )}
                      </Card>

                      {/* Interactive World Map */}
                      <Card className="p-6" data-map-section>
                        {mapHighlightLocation && (
                          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">
                                  Highlighting: {mapHighlightLocation.city || mapHighlightLocation.country}
                                  {mapHighlightLocation.ip && (
                                    <span className="ml-2 text-xs text-blue-600">({mapHighlightLocation.ip})</span>
                                  )}
                                  {mapPreciseCoordinates && (
                                    <span className="ml-2 text-xs text-green-600">📍 Precise location</span>
                      )}
                                </span>
                    </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setMapHighlightLocation(null)
                                  setMapPreciseCoordinates(null)
                                  setShowMapModal(false)
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">Interactive World Map</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Info className="w-3 h-3" />
                              <span>Supports precise coordinates when available</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Click on IP addresses or locations in link details to highlight them on the map. 
                            When precise coordinates are available, the map will show exact locations. 
                            Otherwise, it shows country-level markers. 
                          </p>
                        </div>
                        
                        {finalCountryChartData.length > 0 ? (
                          <InteractiveMap 
                            countryData={finalCountryChartData} 
                            highlightLocation={mapHighlightLocation}
                            preciseCoordinates={mapPreciseCoordinates}
                          />
                        ) : (
                          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500">No geographic data available</p>
                              <p className="text-sm text-gray-400 mt-1">Create some links and generate clicks to see the map</p>
                            </div>
                          </div>
                        )}
                      </Card>

                      {/* Click Details Table */}
                      {linkClicks.length > 0 && (
                        <Card className="p-6">
                          <h3 className="font-bold mb-4 text-gray-800">Recent Click Details</h3>
                              <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                                  <thead>
                                <tr className="bg-gray-50">
                                  <th className="p-2 text-left">Date</th>
                                  <th className="p-2 text-left">IP Address</th>
                                  <th className="p-2 text-left">Country</th>
                                  <th className="p-2 text-left">City</th>
                                  <th className="p-2 text-left">ISP</th>
                                  <th className="p-2 text-left">Device</th>
                                  <th className="p-2 text-left">Browser</th>
                                  <th className="p-2 text-left">OS</th>
                                      <th className="p-2 text-left">Referrer</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                {linkClicks.slice(0, 20).map((click: any, i: number) => (
                                  <tr key={click._id || i} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{click.createdAt ? new Date(click.createdAt).toLocaleString() : "-"}</td>
                                    <td className="p-2">
                                      {click.ipAddress ? (
                                        <button
                                          onClick={() => handleLocationClick(
                                            click.location?.country || 'Unknown',
                                            click.location?.city,
                                            click.ipAddress
                                          )}
                                          className="font-mono text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                          title="Click to view on map"
                                        >
                                          {click.ipAddress}
                                        </button>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                    <td className="p-2">
                                      {click.location?.country ? (
                                        <button
                                          onClick={() => handleLocationClick(
                                            click.location.country,
                                            click.location?.city,
                                            click.ipAddress
                                          )}
                                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                          title="Click to view on map"
                                        >
                                          {click.location.country}
                                        </button>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                    <td className="p-2">
                                      {click.location?.city ? (
                                        <button
                                          onClick={() => handleLocationClick(
                                            click.location?.country || 'Unknown',
                                            click.location.city,
                                            click.ipAddress
                                          )}
                                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                          title="Click to view on map"
                                        >
                                          {click.location.city}
                                        </button>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                        <td className="p-2">{click.device?.type || "-"}</td>
                                        <td className="p-2">{click.device?.browser || "-"}</td>
                                        <td className="p-2">{click.device?.os || "-"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="feedback">
                    <Card className="p-6">
                      <h2 className="text-2xl font-bold mb-4">User Feedback</h2>
                      {feedbacksLoading ? (
                        <div>Loading...</div>
                      ) : feedbacks.length === 0 ? (
                        <div>No feedback yet.</div>
                      ) : (
                        <table className="min-w-full bg-white border">
                          <thead>
                            <tr>
                              <th className="py-2 px-4 border-b">Message</th>
                              <th className="py-2 px-4 border-b">User</th>
                              <th className="py-2 px-4 border-b">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {feedbacks.map(fb => (
                              <tr key={fb._id}>
                                <td className="py-2 px-4 border-b">
                                  {fb.message.length > 80 ? (
                                    <>
                                      {expandedFeedbackId === fb._id ? (
                                        <>
                                          {fb.message}
                                          <span className="text-blue-600 ml-2 cursor-pointer" onClick={() => setExpandedFeedbackId(null)}>[Show less]</span>
                                        </>
                                      ) : (
                                        <>
                                          {fb.message.slice(0, 80)}...
                                          <span className="text-blue-600 ml-2 cursor-pointer" onClick={() => setExpandedFeedbackId(fb._id)}>[Read more]</span>
                                        </>
                                      )}
                                    </>
                                  ) : (
                                    fb.message
                                  )}
                                </td>
                                <td className="py-2 px-4 border-b">{fb.user ? `${fb.user.name} (${fb.user.email})` : 'Anonymous'}</td>
                                <td className="py-2 px-4 border-b">{new Date(fb.createdAt).toLocaleString()}</td>
                              </tr>
                                    ))}
                          </tbody>
                        </table>
                      )}
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* User Details Modal */}
                <Dialog open={!!selectedUser} onOpenChange={() => closeUser()}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        User Details: {selectedUser?.name}
                      </DialogTitle>
                      <DialogDescription>
                        Detailed information about user account and activity
                      </DialogDescription>
                    </DialogHeader>
                    
                    {selectedUser && (
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <Card className="p-4">
                          <h3 className="font-semibold mb-3 text-gray-800">Basic Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Name</label>
                              <p className="text-sm">{selectedUser.name || "N/A"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Email</label>
                              <p className="text-sm">{selectedUser.email}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Role</label>
                              <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                                {selectedUser.role}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Status</label>
                              <Badge variant={selectedUser.isVerified ? "default" : "destructive"}>
                                {selectedUser.isVerified ? "Verified" : "Unverified"}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Subscription Plan</label>
                              <Badge variant="outline">
                                {selectedUser.subscriptionPlan || selectedUser.subscription?.plan || "Free"}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Account Created</label>
                              <p className="text-sm">
                                {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "N/A"}
                              </p>
                            </div>
                          </div>
                        </Card>

                        {/* Activity Information */}
                        <Card className="p-4">
                          <h3 className="font-semibold mb-3 text-gray-800">Activity Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Last Active</label>
                              <p className="text-sm">
                                {selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : "Never"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Last Login IP</label>
                              <p className="text-sm font-mono text-xs">
                                {selectedUser.lastLoginIp || (selectedUser.loginHistory && selectedUser.loginHistory[0]?.ipAddress) || "N/A"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Last Login Location</label>
                              <p className="text-sm">
                                {selectedUser.loginHistory && selectedUser.loginHistory[0]?.location ?
                                  `${selectedUser.loginHistory[0].location.city || ''}${selectedUser.loginHistory[0].location.city ? ', ' : ''}${selectedUser.loginHistory[0].location.country || ''}` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Total Links Created</label>
                              <p className="text-sm font-bold text-blue-600">
                                {selectedUser.totalLinks || links.filter(l => l.user?._id === selectedUser._id).length}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Total Clicks</label>
                              <p className="text-sm font-bold text-green-600">
                                {selectedUser.totalClicks || links.filter(l => l.user?._id === selectedUser._id).reduce((sum, link) => sum + (link.analytics?.totalClicks || 0), 0)}
                              </p>
                            </div>
                          </div>
                        </Card>

                        {/* Login History */}
                        {selectedUser.loginHistory && selectedUser.loginHistory.length > 0 && (
                          <Card className="p-4">
                            <h3 className="font-semibold mb-3 text-gray-800">Recent Login History</h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {selectedUser.loginHistory.slice(0, 10).map((login: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                                  <div>
                                    <span className="font-medium">{new Date(login.timestamp).toLocaleString()}</span>
                                    {login.ipAddress && (
                                      <span className="text-gray-500 ml-2">({login.ipAddress})</span>
                                    )}
                                  </div>
                                  {login.location && (
                                    <span className="text-gray-500">
                                      {login.location.city}, {login.location.country}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </Card>
                        )}

                        {/* User's Links */}
                        <Card className="p-4">
                          <h3 className="font-semibold mb-3 text-gray-800">User's Links</h3>
                          {links.filter(l => l.user?._id === selectedUser._id).length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {links.filter(l => l.user?._id === selectedUser._id).map((link: any) => (
                                <div key={link._id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                                  <div className="flex-1 min-w-0 flex items-center gap-2">
                                    <span className="font-mono font-medium">{link.shortCode}</span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-gray-500 truncate break-all max-w-[180px] cursor-pointer inline-block align-middle" style={{maxWidth:'180px', verticalAlign:'middle'}}>{link.originalUrl}</span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs break-all">{link.originalUrl}</TooltipContent>
                                    </Tooltip>
                                    <Button size="xs" variant="ghost" className="ml-1 px-1 py-0.5" onClick={() => navigator.clipboard.writeText(link.originalUrl)}>
                                      Copy
                                    </Button>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge variant={link.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                                      {link.status}
                                    </Badge>
                                    <span className="text-gray-500">{link.analytics?.totalClicks || 0} clicks</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No links created yet</p>
                          )}
                        </Card>
                      </div>
                    )}

                          <DialogFooter>
                      <Button variant="outline" onClick={closeUser}>Close</Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => selectedUser && handleDeleteUser(selectedUser)}
                      >
                        Delete User
                      </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                {/* Link Details Modal */}
                <Dialog open={!!selectedLink} onOpenChange={() => closeLink()}>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-purple-500" />
                        Link Details: {selectedLink?.shortCode}
                      </DialogTitle>
                      <DialogDescription>
                        Detailed information about link, analytics, and click history
                      </DialogDescription>
                    </DialogHeader>
                    
                    {selectedLink && (
                      <div className="space-y-6">
                        {/* Basic Link Information */}
                        <Card className="p-4">
                          <h3 className="font-semibold mb-3 text-gray-800">Link Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Short Code</label>
                              <p className="text-sm font-mono bg-gray-100 p-2 rounded">{selectedLink.shortCode}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Original URL</label>
                              <p className="text-sm break-all bg-gray-100 p-2 rounded">{selectedLink.originalUrl}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Status</label>
                              <Badge variant={selectedLink.status === 'active' ? "default" : "destructive"}>
                                {selectedLink.status}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Safety Status</label>
                              <Badge variant={selectedLink.safetyStatus?.isSafe ? "default" : "destructive"}>
                                {selectedLink.safetyStatus?.isSafe ? "Safe" : "Unsafe"}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Created By</label>
                              <p className="text-sm">{selectedLink.user?.name || selectedLink.userId || "Unknown"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Created Date</label>
                              <p className="text-sm">
                                {selectedLink.createdAt ? new Date(selectedLink.createdAt).toLocaleString() : "N/A"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Expires At</label>
                              <p className="text-sm">
                                {selectedLink.expiresAt ? new Date(selectedLink.expiresAt).toLocaleString() : "Never"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Password Protected</label>
                              <Badge variant={selectedLink.password ? "default" : "secondary"}>
                                {selectedLink.password ? "Yes" : "No"}
                              </Badge>
                            </div>
                          </div>
                        </Card>

                        {/* Analytics Summary */}
                        {linkAnalytics && (
                          <Card className="p-4">
                            <h3 className="font-semibold mb-3 text-gray-800">Analytics Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{linkAnalytics.totalClicks || 0}</p>
                                <p className="text-sm text-gray-600">Total Clicks</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{linkAnalytics.uniqueVisitors || 0}</p>
                                <p className="text-sm text-gray-600">Unique Visitors</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">{linkAnalytics.topCountries?.length || 0}</p>
                                <p className="text-sm text-gray-600">Countries</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-orange-600">{linkAnalytics.topBrowsers?.length || 0}</p>
                                <p className="text-sm text-gray-600">Browsers</p>
                              </div>
                            </div>
                          </Card>
                        )}

                        {/* Geographic Distribution */}
                        {linkAnalytics?.topCountries && linkAnalytics.topCountries.length > 0 && (
                          <Card className="p-4">
                            <h3 className="font-semibold mb-3 text-gray-800">Top Countries</h3>
                            <div className="space-y-2">
                              {linkAnalytics.topCountries.slice(0, 10).map((country: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span className="text-sm">{country._id || country.country}</span>
                                  <Badge variant="outline">{country.count} clicks</Badge>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )}

                        {/* Device & Browser Breakdown */}
                        {(linkAnalytics?.topBrowsers || linkAnalytics?.topDevices) && (
                          <Card className="p-4">
                            <h3 className="font-semibold mb-3 text-gray-800">Device & Browser Usage</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {linkAnalytics.topBrowsers && (
                                <div>
                                  <h4 className="font-medium mb-2">Top Browsers</h4>
                                  <div className="space-y-1">
                                    {linkAnalytics.topBrowsers.slice(0, 5).map((browser: any, index: number) => (
                                      <div key={index} className="flex justify-between items-center text-xs">
                                        <span>{browser._id || browser.browser}</span>
                                        <span className="text-gray-500">{browser.count}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {linkAnalytics.topDevices && (
                                <div>
                                  <h4 className="font-medium mb-2">Top Devices</h4>
                                  <div className="space-y-1">
                                    {linkAnalytics.topDevices.slice(0, 5).map((device: any, index: number) => (
                                      <div key={index} className="flex justify-between items-center text-xs">
                                        <span>{device._id || device.device}</span>
                                        <span className="text-gray-500">{device.count}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        )}

                        {/* Recent Click Details */}
                        {linkClicks && linkClicks.length > 0 && (
                          <Card className="p-4">
                            <h3 className="font-semibold mb-3 text-gray-800">Recent Click Details</h3>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="p-2 text-left">Date</th>
                                    <th className="p-2 text-left">IP Address</th>
                                    <th className="p-2 text-left">Country</th>
                                    <th className="p-2 text-left">City</th>
                                    <th className="p-2 text-left">Device</th>
                                    <th className="p-2 text-left">Browser</th>
                                    <th className="p-2 text-left">OS</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {linkClicks.slice(0, 20).map((click: any, i: number) => (
                                    <tr key={click._id || i} className="border-b hover:bg-gray-50">
                                      <td className="p-2">{click.createdAt ? new Date(click.createdAt).toLocaleString() : "-"}</td>
                                      <td className="p-2">
                                        {click.ipAddress ? (
                                          <button
                                            onClick={() => handleLocationClick(
                                              click.location?.country || 'Unknown',
                                              click.location?.city,
                                              click.ipAddress
                                            )}
                                            className="font-mono text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                            title="Click to view on map"
                                          >
                                            {click.ipAddress}
                                          </button>
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                      <td className="p-2">
                                        {click.location?.country ? (
                                          <button
                                            onClick={() => handleLocationClick(
                                              click.location.country,
                                              click.location?.city,
                                              click.ipAddress
                                            )}
                                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                            title="Click to view on map"
                                          >
                                            {click.location.country}
                                          </button>
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                      <td className="p-2">
                                        {click.location?.city ? (
                                          <button
                                            onClick={() => handleLocationClick(
                                              click.location?.country || 'Unknown',
                                              click.location.city,
                                              click.ipAddress
                                            )}
                                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                            title="Click to view on map"
                                          >
                                            {click.location.city}
                                          </button>
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                      <td className="p-2">{click.device?.type || "-"}</td>
                                      <td className="p-2">{click.device?.browser || "-"}</td>
                                      <td className="p-2">{click.device?.os || "-"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </Card>
                        )}
                      </div>
                    )}

                    <DialogFooter>
                      <Button variant="outline" onClick={closeLink}>Close</Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => selectedLink && handleDeleteLink(selectedLink)}
                      >
                        Delete Link
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            {toastMsg && (
              <Toast variant={toastType === 'error' ? 'destructive' : 'default'} open={!!toastMsg} onOpenChange={v => !v && setToastMsg(null)}>
                <ToastTitle>{toastType === 'error' ? 'Error' : 'Success'}</ToastTitle>
                <ToastDescription>{toastMsg}</ToastDescription>
                <ToastClose />
              </Toast>
            )}
          </Card>
        </div>
      </TooltipProvider>
    </ToastProvider>
  )
} 