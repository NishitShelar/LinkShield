"use client"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { config } from "@/lib/config"

declare global {
  interface Window {
    google: any
  }
}

interface GoogleSignInProps {
  onSuccess: (idToken: string) => void
  onError?: (error: any) => void
  text?: string
}

export function GoogleSignIn({ onSuccess, onError, text = "Continue with Google" }: GoogleSignInProps) {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: (response: any) => {
            if (response.credential) {
              onSuccess(response.credential)
            } else {
              onError?.(new Error("No credential received"))
            }
          },
        });
        const btnDiv = document.getElementById("google-signin-btn");
        if (btnDiv) {
          window.google.accounts.id.renderButton(btnDiv, {
            theme: "outline",
            size: "large",
            width: 320,
            text: "continue_with",
            shape: "rectangular",
          });
        }
      }
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [onSuccess, onError])

  const handleClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt()
    }
  }

  return (
    <div
      id="google-signin-btn"
      className="w-full flex justify-center mb-2 min-h-[44px] h-[44px] max-h-[44px] overflow-hidden sm:min-h-[40px] sm:h-[40px] sm:max-h-[40px]"
      style={{ marginBottom: 8 }}
    ></div>
  )
}
