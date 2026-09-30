import { useDashboard, useProblems } from '../hooks/useProblems';
import { getApiErrorMessage } from '../services/api';
import { PageHeader } from './ui/PageHeader';
import { Banner } from './ui/Banner';
import StatTiles from './StatTiles';
import DifficultyBars from './DifficultyBars';

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900">{value}</dd>
      {sub && <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

export default function ProgressChart() {
  const dashboard = useDashboard();
  const problems = useProblems();
  const error = dashboard.error ?? problems.error;

  const solved = problems.data?.filter((p) => p.is_solved) ?? [];
  const revised = solved.filter((p) => p.revision_count > 0);
  const totalRevisions = solved.reduce((s, p) => s + (p.revision_count || 0), 0);
  const revisionRate = solved.length ? (revised.length / solved.length) * 100 : 0;
  const avgRevisions = solved.length ? totalRevisions / solved.length : 0;
  const scheduled = solved.filter((p) => p.revision_interval_days).length;

  return (
    <>
      <PageHeader title="Progress" description="Solving and revision consistency over everything you track." />

      {error && <Banner tone="error">{getApiErrorMessage(error)}</Banner>}

      <StatTiles stats={dashboard.data?.stats} loading={dashboard.isLoading} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">Solved by difficulty</h2>
          <DifficultyBars stats={dashboard.data?.stats} />
        </section>

        <section className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">Revision</h2>
          {problems.isLoading ? (
            <div className="grid grid-cols-2 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-zinc-100" />
              ))}
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Metric
                label="Revision rate"
                value={`${revisionRate.toFixed(0)}%`}
                sub={`${revised.length} of ${solved.length} solved problems revised`}
              />
              <Metric
                label="Average revisions"
                value={avgRevisions.toFixed(1)}
                sub="per solved problem"
              />
              <Metric label="Total revisions" value={String(totalRevisions)} />
              <Metric
                label="On a schedule"
                value={String(scheduled)}
                sub={`of ${solved.length} solved`}
              />
            </dl>
          )}
        </section>
      </div>
    </>
  );
}
