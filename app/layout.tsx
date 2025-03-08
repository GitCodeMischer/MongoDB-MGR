import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

// Load F1 Font locally
const f1Font = localFont({
  src: [
    {
      path: "../public/fonts/Formula1-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Formula1-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-f1",
})

export const metadata: Metadata = {
  title: "MongoDB Dashboard",
  description: "MongoDB database management dashboard",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${f1Font.variable} font-f1`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'