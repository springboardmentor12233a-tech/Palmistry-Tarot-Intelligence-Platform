import { HAND_SKELETON, type PalmAnalysis } from "@/lib/palm";
import { cn } from "@/lib/utils";

type Props = {
  imageUrl: string;
  analysis: PalmAnalysis;
  showLandmarks?: boolean;
  showLines?: boolean;
  className?: string;
};

function toPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length < 3) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x * 100} ${p.y * 100}`).join(" ");
  }
  let d = `M ${points[0]!.x * 100} ${points[0]!.y * 100}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const current = points[i]!;
    const next = points[i + 1]!;
    const midX = ((current.x + next.x) / 2) * 100;
    const midY = ((current.y + next.y) / 2) * 100;
    d += ` Q ${current.x * 100} ${current.y * 100} ${midX} ${midY}`;
  }
  const last = points[points.length - 1]!;
  d += ` L ${last.x * 100} ${last.y * 100}`;
  return d;
}

export function PalmOverlay({
  imageUrl,
  analysis,
  showLandmarks = true,
  showLines = true,
  className,
}: Props) {
  const map = new Map(analysis.landmarks.map((l) => [l.id, l]));

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border", className)}>
      <img src={imageUrl} alt="Uploaded palm with biometric segmentation overlay" className="block w-full" />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {showLandmarks &&
          HAND_SKELETON.map(([a, b]) => {
            const pa = map.get(a);
            const pb = map.get(b);
            if (!pa || !pb) return null;
            return (
              <line
                key={`${a}-${b}`}
                x1={pa.x * 100}
                y1={pa.y * 100}
                x2={pb.x * 100}
                y2={pb.y * 100}
                stroke="var(--gold)"
                strokeWidth={0.35}
                strokeOpacity={0.6}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

        {showLines && (
          <g fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke">
            <path
              d={toPath(analysis.lines.life)}
              stroke="var(--life-line)"
              strokeWidth={0.9}
              className="glow-life"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={toPath(analysis.lines.head)}
              stroke="var(--head-line)"
              strokeWidth={0.9}
              className="glow-head"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={toPath(analysis.lines.heart)}
              stroke="var(--heart-line)"
              strokeWidth={0.9}
              className="glow-heart"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}

        {showLandmarks &&
          analysis.landmarks.map((l) => (
            <g key={l.id}>
              <circle cx={l.x * 100} cy={l.y * 100} r={1.1} fill="var(--gold)" fillOpacity={0.9} />
              <circle
                cx={l.x * 100}
                cy={l.y * 100}
                r={2.1}
                fill="none"
                stroke="var(--gold)"
                strokeOpacity={0.35}
                strokeWidth={0.25}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
      </svg>

      <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-widest">
        <span className="rounded-full bg-background/80 px-2 py-1 text-heart-line">Heart</span>
        <span className="rounded-full bg-background/80 px-2 py-1 text-head-line">Head</span>
        <span className="rounded-full bg-background/80 px-2 py-1 text-life-line">Life</span>
        <span className="rounded-full bg-background/80 px-2 py-1 text-primary">
          {analysis.landmarks.length} anchors
        </span>
      </div>
    </div>
  );
}
