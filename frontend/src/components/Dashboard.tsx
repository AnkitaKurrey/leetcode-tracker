import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDashboard, useProblems } from '../hooks/useProblems';
import { getApiErrorMessage } from '../services/api';
import { PageHeader } from './ui/PageHeader';
import { Banner } from './ui/Banner';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import ProblemTable from './ProblemTable';
import StatTiles from './StatTiles';
import DifficultyBars from './DifficultyBars';
import ProblemForm from './ProblemForm';
import { GettingStarted } from './HowItWorks';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const { data: dashboard, isLoading, error } = useDashboard();
  const { data: recent } = useProblems({ is_solved: false });

  if (error) {
    return (
      <>
        <PageHeader title="Overview" />
        <Banner tone="error">{getApiErrorMessage(error)}</Banner>
      </>
    );
  }

  const stats = dashboard?.stats;
  const attention = dashboard
    ? [...dashboard.overdueProblems, ...dashboard.dueProblems]
    : undefined;
  const unsolved = recent?.slice(0, 5);

  if (!isLoading && stats && stats.total === 0) {
    return (
      <>
        <PageHeader title="Overview" />
        <GettingStarted onAdd={() => setShowAdd(true)} />
        {showAdd && <ProblemForm onClose={() => setShowAdd(false)} />}
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Overview"
        description="Where you stand and what to revise today."
        actions={
          <Button variant="primary" onClick={() => navigate('/problems?new=1')}>
            Add problem
          </Button>
        }
      />

      <StatTiles stats={stats} loading={isLoading} />

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Needs revision</h2>
          {attention && attention.length > 0 && (
            <Link to="/due" className="text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:underline">
              View all
            </Link>
          )}
        </div>
        <ProblemTable
          problems={attention?.slice(0, 8)}
          loading={isLoading}
          compact
          empty={
            <EmptyState
              title="Nothing due today"
              description="Solved problems with a revision schedule appear here when their date arrives."
            />
          }
        />
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="min-w-0 lg:col-span-3">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Unsolved</h2>
            <Link to="/problems?solved=false" className="text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:underline">
              View all
            </Link>
          </div>
          <ProblemTable
            problems={unsolved}
            loading={!recent}
            compact
            empty={
              <EmptyState
                title="No unsolved problems"
                description="Everything you have added is solved. Add the next one you plan to work on."
                action={<Button size="sm" onClick={() => navigate('/problems?new=1')}>Add problem</Button>}
              />
            }
          />
        </section>
        <section className="min-w-0 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900">Solved by difficulty</h2>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <DifficultyBars stats={stats} />
          </div>
        </section>
      </div>
    </>
  );
}
