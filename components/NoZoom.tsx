'use client'
import { useEffect } from 'react';

/**
 * Blocks pinch-zoom and double-tap-zoom on iOS/Android.
 * Add <NoZoom /> anywhere once (e.g. inside <body> in RootLayout).
 * ⓘ  Still allow normal scrolling with touch-action CSS below.
 */
export default function NoZoom() {
  useEffect(() => {
    // Block pinch-zoom (gesturestart / gesturechange)
    const lock = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart',  lock, { passive: false });
    document.addEventListener('gesturechange', lock, { passive: false });

    // Block double-tap zoom (two taps < 300 ms apart)
    let last = 0;
    const blockDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (now - last < 300) e.preventDefault();
      last = now;
    };
    document.addEventListener('touchend', blockDoubleTap, { passive: false });

    return () => {
      document.removeEventListener('gesturestart',  lock);
      document.removeEventListener('gesturechange', lock);
      document.removeEventListener('touchend',       blockDoubleTap);
    };
  }, []);

  return null; // nothing to render
}
