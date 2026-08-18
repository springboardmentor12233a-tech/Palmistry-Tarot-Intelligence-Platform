import { useMemo } from "react";

// A handful of softly twinkling dots, positioned once per mount. Purely
// decorative, kept behind all content and very low opacity so it reads as
// atmosphere rather than noise.
export default function Starfield({ count = 40 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.6 + 0.6,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 3,
      })),
    [count]
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold/70"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animation: `pulseLine ${s.duration}s ease-in-out ${s.delay}s infinite`,
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
}
