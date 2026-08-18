export default function ConstellationLoader({ label = "Tracing your lines..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16">
      <svg width="180" height="90" viewBox="0 0 180 90">
        <path
          d="M10 60 C 40 20, 60 15, 80 45 C 100 75, 120 20, 170 30"
          className="thread-line"
        />
        {[
          [10, 60],
          [80, 45],
          [170, 30],
          [45, 30],
          [130, 55],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="3"
            className="thread-node"
            style={{ animation: `pulseLine 2.2s ease-in-out ${i * 0.25}s infinite` }}
          />
        ))}
      </svg>
      <p className="text-sm text-muted font-mono tracking-wide">{label}</p>
    </div>
  );
}
