/* ------------------------------------------------------------------
   file: app/layout.tsx
------------------------------------------------------------------ */
import '@/styles/globals.css';
import { ReactNode } from 'react';

import Providers       from './providers';
import GlowingBorder   from '@/components/GlowingBorder';
import NoZoom          from '@/components/NoZoom';         // pinch-/double-tap blocker
import GlowyBackground from '@/components/GlowyBackground'; // animated blur/zoom bg

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <title>DisputApp</title>

        {/* Manifest & icons */}
        <link rel="manifest"            href="/manifest.json" />
        <link rel="icon"     type="image/png" href="/icons/icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="57x57"  href="/icons/icon-57x57.png"  />
        <link rel="apple-touch-icon" sizes="72x72"  href="/icons/icon-72x72.png"  />
        <link rel="apple-touch-icon" sizes="76x76"  href="/icons/icon-76x76.png"  />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />

        {/* PWA / iOS handling */}
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable"        content="yes"   />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="theme-color"                         content="#1a202c" />

        {/* Critical first-paint background to stop white flash */}
        <style>{`html,body{background:#1a202c;}`}</style>
      </head>

      <body className="min-h-screen relative flex flex-col bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
        <NoZoom />             {/* disables pinch-/double-tap zoom */}
        <GlowingBorder />      {/* decorative blobs */}
        <GlowyBackground />    {/* animated glowy blur/zoom background */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
