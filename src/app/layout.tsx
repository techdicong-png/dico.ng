import type { Metadata } from "next"
import { Inter } from "next/font/google" // Changed from Geist
import Script from "next/script"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { PageTracker } from "@/components/layout/PageTracker"

// Use Inter instead of Geist
const inter = Inter({
  variable: "--font-geist-sans", // Keep the same CSS variable name so your tailwind config doesn't break
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "DICO — Digital Constituency Office",
  description:
    "DICO connects verified voters directly to their representatives through transparent, token-powered civic engagement. Digital town halls, live polling, and the CIVICT token economy.",
  openGraph: {
    title: "DICO — Digital Constituency Office",
    description:
      "Connecting verified voters directly to their representatives.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`} // Use inter.variable
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script id="motion-ready" strategy="afterInteractive">
          {`document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(()=>document.body.classList.add('motion-ready')))`}
        </Script>
        {children}
        <Toaster richColors position="top-right" />
        <PageTracker/>
      </body>
    </html>
  )
}