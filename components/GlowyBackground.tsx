// src/components/GlowyBackground.tsx
export default function GlowyBackground() {
  return (
    <div
      className="glowy-bg fixed inset-0 -z-10 pointer-events-none"
      style={{
        backgroundImage: "url('/icons/GPT.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.65,
        filter: "blur(28px) brightness(1.15)",
        willChange: "transform, opacity",
      }}
    />
  );
}
