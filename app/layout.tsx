import '@/styles/globals.css'
import { ReactNode } from 'react'
import Providers from './providers'
import GlowingBorder from '@/components/GlowingBorder'
import Head from 'next/head' // 👈 добавляем Head

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <title>Disput.ai – AI Legal Assistant</title> {/* 👈 название вкладки */}
        <link rel="icon" href="/mainicon.png" type="image/x-icon" /> {/* 👈 иконка */}
      </head>
      <body className="min-h-screen bg-gray-50 relative overflow-hidden">
        <GlowingBorder />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
