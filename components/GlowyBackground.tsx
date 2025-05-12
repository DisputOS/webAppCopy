// src/components/GlowyBackground.tsx

export default function GlowyBackground() {
  return (
    <>
      <div className="glowy-bg" />

      <style jsx>{`
        .glowy-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: url('/icons/GPT.png') center/cover no-repeat;
          pointer-events: none;
          
          /* 🟢 Ensure transform is present and hint the browser */
          transform: scale(1);
          will-change: transform, opacity;

          opacity: 0.65;
          filter: blur(28px) brightness(1.15);
          animation: fadeZoom 18s ease-in-out infinite alternate;
        }

        @keyframes fadeZoom {
          0% {
            transform: scale(1);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.72;
          }
          100% {
            transform: scale(1.06);
            opacity: 0.85;
          }
        }
      `}</style>
    </>
  );
}
