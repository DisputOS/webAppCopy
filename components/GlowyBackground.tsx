/**
 * A full-screen, softly zooming & blurred background layer.
 * Drop <GlowyBackground /> anywhere near the top of your layout.
 */
export default function GlowyBackground() {
  return (
    <>
      {/* background layer */}
      <div
        className="glowy-bg fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: "url('/icons/GPT.png')", // change to your image
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* local styles only for this component */}
      <style jsx>{`
        .glowy-bg {
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
