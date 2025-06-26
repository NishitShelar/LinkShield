"use client"
import { createContext, useContext, useState, useEffect } from "react"
import type React from "react"
import { api } from "@/lib/api"

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    if (savedToken) {
      setToken(savedToken)
      // Fetch user profile with token
      api.getCurrentUser(savedToken).then((res) => {
        if (res.success) setUser(res.data)
        else setUser(null)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (userData: any, userToken: string) => {
    setLoading(true);
    setToken(userToken);
    localStorage.setItem("token", userToken);
    // Fetch user profile with token to ensure hydration
    const res = await api.getCurrentUser(userToken);
    if (res.success) setUser(res.data);
    else setUser(null);
    setLoading(false);
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
  }

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
