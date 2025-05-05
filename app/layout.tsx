import '@/styles/globals.css'
import { ReactNode } from 'react'
import Providers from './providers' // ← import your client wrapper

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster richColors />
        {children}
      </body>
    </html>
  );
}
