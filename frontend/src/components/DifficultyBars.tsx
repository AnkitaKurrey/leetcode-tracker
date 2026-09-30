import type { DashboardSummary } from '../services/api';

interface DifficultyBarsProps {
  stats: DashboardSummary['stats'] | undefined;
}

const ROWS = [
  { key: 'EASY', label: 'Easy', bar: 'bg-emerald-600' },
  { key: 'MEDIUM', label: 'Medium', bar: 'bg-amber-500' },
  { key: 'HARD', label: 'Hard', bar: 'bg-red-600' },
] as const;

/** Three horizontal bars, one hue per difficulty, label + count on every row. */
export default function DifficultyBars({ stats }: DifficultyBarsProps) {
  const solved = stats?.solved ?? 0;
  return (
    <div className="space-y-3">
      {ROWS.map((r) => {
        const n = stats?.byDifficulty[r.key] ?? 0;
        const pct = solved > 0 ? (n / solved) * 100 : 0;
        return (
          <div key={r.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-700">{r.label}</span>
              <span className="tabular-nums text-zinc-500">
                {n}
                {solved > 0 && <span className="text-zinc-400"> · {Math.round(pct)}%</span>}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-sm bg-zinc-100">
              <div
                className={`h-1.5 rounded-sm ${r.bar} transition-[width] duration-300`}
                style={{ width: `${pct}%` }}
                role="img"
                aria-label={`${r.label}: ${n} solved`}
              />
            </div>
          </div>
        );
      })}
      {solved === 0 && (
        <p className="text-xs text-zinc-500">No solved problems yet.</p>
      )}
    </div>
  );
}
