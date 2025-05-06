import '@/styles/globals.css'
import { ReactNode } from 'react'
import Providers from './providers'
import GlowingBorder from '@/components/GlowingBorder' // 👈 добавляем фон

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-gray-50 relative overflow-hidden"> {/* 👈 обязательно overflow-hidden */}
        <GlowingBorder /> {/* 👈 вставка фонового свечения */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
