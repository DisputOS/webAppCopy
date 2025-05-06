import '@/styles/globals.css'
import { ReactNode } from 'react'
import Providers from './providers'
import GlowingBorder from '@/components/GlowingBorder'


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <title>DisputApp</title>
        <link rel="icon" type="image/png" href="/mainicon.png" />
        <link rel="apple-touch-icon" href="/mainicon.png" />
        <link rel="manifest" href="/manifest.json" />
        
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <meta name="theme-color" content="#1a202c" />
        {/* Можно добавить ещё OpenGraph, favicon.ico и пр. */}
      </head>
      <body className="min-h-screen bg-gray-50 relative">
        <GlowingBorder />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
