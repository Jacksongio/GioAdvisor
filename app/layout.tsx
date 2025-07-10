import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GioAdvisor - Global Conflict Simulation Platform",
  description: "Simulate political scenarios and analyze international conflicts with advanced AI-powered insights.",
  icons: {
    shortcut: '/favicon.ico'
  },
  keywords: ["political simulation", "conflict analysis", "international relations", "diplomacy", "geopolitics"],
    generator: 'v0.dev',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
