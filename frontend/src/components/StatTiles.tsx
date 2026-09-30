import type { DashboardSummary } from '../services/api';

interface StatTilesProps {
  stats: DashboardSummary['stats'] | undefined;
  loading?: boolean;
}

export default function StatTiles({ stats, loading }: StatTilesProps) {
  const solvedPct =
    stats && stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;

  const tiles = [
    { label: 'Problems', value: stats?.total, sub: 'tracked' },
    { label: 'Solved', value: stats?.solved, sub: stats ? `${solvedPct}% of total` : '' },
    { label: 'Due today', value: stats?.due, sub: 'to revise', tone: stats?.due ? 'text-amber-700' : '' },
    { label: 'Overdue', value: stats?.overdue, sub: 'past due date', tone: stats?.overdue ? 'text-red-700' : '' },
  ];

  return (
    <dl className="grid grid-cols-2 divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white sm:grid-cols-4 sm:divide-x">
      {tiles.map((t) => (
        <div key={t.label} className="px-4 py-3 [&:nth-child(-n+2)]:border-b sm:[&:nth-child(-n+2)]:border-b-0 border-zinc-200">
          <dt className="text-xs font-medium text-zinc-500">{t.label}</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            {loading || t.value === undefined ? (
              <span className="inline-block h-6 w-10 animate-pulse rounded bg-zinc-100" />
            ) : (
              <span className={`text-2xl font-semibold tabular-nums tracking-tight ${t.tone || 'text-zinc-900'}`}>
                {t.value}
              </span>
            )}
            {t.sub && <span className="text-xs text-zinc-500">{t.sub}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
