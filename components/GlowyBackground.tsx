"use client";
// src/components/GlowyBackground.tsx

export default function GlowyBackground() {
  return (
    <>
      <div className="blob-bg">
        <div className="blob blob--orange" />
        <div className="blob blob--blue" />
        <div className="blob blob--cyan" />
      </div>

      <style jsx>{`
        .blob-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: -10;
          overflow: hidden;
        }

        .blob {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(200px);
          opacity: 0.6;
          animation: blobFloat 20s ease-in-out infinite alternate;
          will-change: transform;
        }

        .blob--orange {
          background: radial-gradient(circle, rgba(255,155,0,1) 0%, rgba(255,155,0,0) 70%);
          top: 30%;
          left: 40%;
          animation-delay: 0s;
        }

        .blob--blue {
          background: radial-gradient(circle, rgba(0,125,255,1) 0%, rgba(0,125,255,0) 70%);
          top: 35%;
          left: 55%;
          animation-delay: 5s;
        }

        .blob--cyan {
          background: radial-gradient(circle, rgba(0,200,150,1) 0%, rgba(0,200,150,0) 70%);
          top: 45%;
          left: 50%;
          animation-delay: 10s;
        }

        @keyframes blobFloat {
          0%   { transform: translate(0, 0)     scale(1);   }
          50%  { transform: translate(20px,-10px) scale(1.05); }
          100% { transform: translate(-10px,20px) scale(0.95); }
        }
      `}</style>
    </>
  );
}
