export default function MiniSpreadIcon({ layout }) {
  if (!layout?.length) return <div className="w-full h-12" />;
  return (
    <svg viewBox="0 0 100 60" className="w-full h-12">
      {layout.map((p, i) => (
        <rect
          key={i}
          x={p.x - 4}
          y={(p.y / 100) * 60 - 6}
          width="8"
          height="12"
          rx="1.2"
          transform={p.r ? `rotate(${p.r} ${p.x} ${(p.y / 100) * 60})` : undefined}
          fill="#33101E"
          opacity="0.75"
        />
      ))}
    </svg>
  );
}
