"use client"

export default function Footer() {
  return (
    <footer className="py-6 px-4 bg-gradient-to-r from-blue-50 to-purple-50 text-center text-gray-600 text-sm border-t">
      <div>&copy; {new Date().getFullYear()} LinkShield. All rights reserved. &bull; <a href="mailto:noreply.linkshield@gmail.com" className="underline hover:text-blue-600">noreply.linkshield@gmail.com</a></div>
    </footer>
  )
}
