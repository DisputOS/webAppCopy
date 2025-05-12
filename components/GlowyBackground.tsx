// src/components/GlowyBackground.tsx
"use client";

export default function GlowyBackground() {
  return (
    <>
      <div className="glowy-bg" />

      <style jsx>{`
        .glowy-bg {
          position: fixed;
          inset: 0;
          z-index: -10;
          pointer-events: none;

          /* translucent multi-color glow */
          background: linear-gradient(
            135deg,
            rgba(255, 0, 150, 0.4),
            rgba(0, 200, 255, 0.4)
          );

          /* blur & brighten whatever’s behind this overlay */
          backdrop-filter: blur(30px) brightness(1.1);

          /* prepare for animation */
          transform: scale(1);
          will-change: transform, opacity;

          /* gentle zoom + fade loop */
          animation: fadeZoom 18s ease-in-out infinite alternate;
        }

        @keyframes fadeZoom {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.02);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.04);
            opacity: 0.6;
          }
        }
      `}</style>
    </>
  );
}
