import { ARCHETYPE_TRAITS, type PalmMetrics } from "@/lib/palm";

export function MetricsPanel({
  metrics,
  landmarkMs,
  inferenceMs,
  landmarkCount,
}: {
  metrics: PalmMetrics | null;
  landmarkMs: number | null;
  inferenceMs: number | null;
  landmarkCount: number | null;
}) {
  const rows: Array<{ label: string; value: string; note?: string; ok?: boolean | undefined }> = [
    {
      label: "Landmark extraction",
      value: landmarkMs === null ? "—" : `${landmarkMs} ms`,
      note: "budget < 500 ms",
      ok: landmarkMs === null ? undefined : landmarkMs < 500,
    },
    {
      label: "Model inference",
      value: inferenceMs === null ? "—" : `${inferenceMs} ms`,
      note: "budget < 2000 ms",
      ok: inferenceMs === null ? undefined : inferenceMs < 2000,
    },
    { label: "Anchors resolved", value: landmarkCount === null ? "—" : `${landmarkCount} / 21` },
    { label: "R_aspect", value: metrics ? metrics.aspectRatio.toFixed(3) : "—", note: "‖P0−P9‖ / ‖P9−P12‖" },
    { label: "Heart line", value: metrics ? metrics.heartLineLength.toFixed(3) : "—" },
    { label: "Head line", value: metrics ? metrics.headLineLength.toFixed(3) : "—" },
    { label: "Life line", value: metrics ? metrics.lifeLineLength.toFixed(3) : "—" },
  ];

  return (
    <div className="surface-panel p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-lg">Analytics &amp; Metrics</h3>
        {metrics && (
          <span className="text-xs uppercase tracking-[0.18em] text-primary">
            {ARCHETYPE_TRAITS[metrics.archetype].element}
          </span>
        )}
      </div>
      <div className="gold-rule my-4" />
      <dl className="space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">
              {row.label}
              {row.note && (
                <span className="ml-2 text-[0.65rem] uppercase tracking-wider opacity-70">
                  {row.note}
                </span>
              )}
            </dt>
            <dd
              className={
                row.ok === undefined
                  ? "font-mono text-foreground"
                  : row.ok
                    ? "font-mono text-head-line"
                    : "font-mono text-life-line"
              }
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {metrics && (
        <p className="mt-4 rounded-xl border border-border bg-background/40 p-3 text-xs text-muted-foreground">
          <span className="text-primary">{metrics.archetype} hand</span> —{" "}
          {ARCHETYPE_TRAITS[metrics.archetype].keywords}. {metrics.archetypeRationale}
        </p>
      )}
    </div>
  );
}
