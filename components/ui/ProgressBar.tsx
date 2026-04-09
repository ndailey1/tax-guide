"use client";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-[5px] bg-tax-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-600"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #4C9AFF, #36B37E)",
          }}
        />
      </div>
      <span className="font-mono text-[11px] text-tax-muted">
        {Math.round(pct)}%
      </span>
    </div>
  );
}
