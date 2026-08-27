/**
 * The orange 4-point sparkle-burst used on the loading/analysing screens
 * (see Figma: "AnalysingLoader"). Composed of a large star, a medium star,
 * a tiny star, and a small dot, each with a soft gradient fade at the tips.
 */
export function SparkleBurst({ size = 120, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={animate ? "animate-[sparkle-pulse_1.8s_ease-in-out_infinite]" : ""}
    >
      <defs>
        <radialGradient id="sparkle-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f4602a" />
          <stop offset="100%" stopColor="#f4602a" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      {/* large star, top-right */}
      <path
        d="M124 20 C126 55 134 82 168 84 C134 86 126 113 124 148 C122 113 114 86 80 84 C114 82 122 55 124 20 Z"
        fill="url(#sparkle-fade)"
      />
      {/* medium star, bottom-left */}
      <path
        d="M78 96 C79.5 116 85 132 106 133.5 C85 135 79.5 151 78 171 C76.5 151 71 135 50 133.5 C71 132 76.5 116 78 96 Z"
        fill="#f4602a"
      />
      {/* tiny star, bottom-right */}
      <path
        d="M158 118 C158.8 128 161.5 136 172 136.8 C161.5 137.6 158.8 145.6 158 155.6 C157.2 145.6 154.5 137.6 144 136.8 C154.5 136 157.2 128 158 118 Z"
        fill="#f4602a"
        opacity="0.55"
      />
      {/* small dot, upper-left */}
      <circle cx="46" cy="60" r="9" fill="#f4602a" />

      <style>{`
        @keyframes sparkle-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
    </svg>
  );
}
