"use client";
// src/components/GlowyBackground.tsx

export default function GlowyBackground() {
 return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <filter id="wavy">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.005 0.01"
            numOctaves="2"
            seed="4"
            result="turb"
          >
            <animate
              attributeName="baseFrequency"
              values="0.005 0.01;0.007 0.012;0.005 0.01"
              dur="12s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turb" scale="25" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="animated-bg" />
    </>
  );
}
