import '@/styles/globals.css'
import { ReactNode } from 'react'
import Providers from './providers'
import GlowingBorder from '@/components/GlowingBorder'

// If you want to keep <title> and other static SEO meta separate,
// you can also move them to app/head.tsx instead.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <title>DisputApp</title>

        {/* Icons & manifest */}
        <link rel="icon" type="image/png" href="/mainicon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* PWA / iOS status-bar handling */}
     <meta
  name="viewport"
  content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
/>

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#1a202c" />

        {/* Apple touch icons */}
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
      </head>

      {/* bg-gray-50 ⟶ change to your dark color if you want the whole page dark */}
      <body className="min-h-screen relative">
        <GlowingBorder />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
