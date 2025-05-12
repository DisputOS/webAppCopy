"use client";
// src/components/GlowyBackground.tsx

export default function GlowyBackground() {
 return (
    <>
      <div className="blobs-container">
        <div className="blob blob--orange" />
        <div className="blob blob--blue" />
        <div className="blob blob--cyan" />
      </div>

      <style jsx>{`
        .blobs-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: -10;
          overflow: hidden;
        }
        .blob {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(200px);
          opacity: 0.6;
          animation: float 20s ease-in-out infinite alternate;
        }
        .blob--orange {
          background: radial-gradient(circle, #ff9b00 0%, transparent 70%);
          top: 25%;
          left: 40%;
          animation-delay: 0s;
        }
        .blob--blue {
          background: radial-gradient(circle, #007dff 0%, transparent 70%);
          top: 35%;
          left: 55%;
          animation-delay: 6s;
        }
        .blob--cyan {
          background: radial-gradient(circle, #00c896 0%, transparent 70%);
          top: 45%;
          left: 50%;
          animation-delay: 12s;
        }
        @keyframes float {
          0%   { transform: translate(0, 0)       scale(1);   }
          50%  { transform: translate(30px, -20px) scale(1.05); }
          100% { transform: translate(-20px, 30px) scale(0.95); }
        }
      `}</style>
    </>
  );
}
