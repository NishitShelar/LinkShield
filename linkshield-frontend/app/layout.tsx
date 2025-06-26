import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import Footer from "@/components/layout/footer"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LinkShield - Beautiful URL Shortener",
  description: "Create beautiful short links with advanced analytics",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@sentry/nextjs');
    }
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
