import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import { Toaster } from "@/components/ui/sonner" // <-- Import the Toaster
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
        {/* Add the Toaster here so it renders globally */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}