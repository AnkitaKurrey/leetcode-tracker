import { Link } from 'react-router-dom';
import { useDueProblems, useOverdueProblems } from '../hooks/useProblems';
import { getApiErrorMessage } from '../services/api';
import ProblemTable from './ProblemTable';
import { PageHeader } from './ui/PageHeader';
import { Banner } from './ui/Banner';
import { EmptyState } from './ui/EmptyState';

export default function DueProblems() {
  const due = useDueProblems();
  const overdue = useOverdueProblems();
  const isLoading = due.isLoading || overdue.isLoading;
  const error = due.error ?? overdue.error;

  const total = (due.data?.length ?? 0) + (overdue.data?.length ?? 0);

  return (
    <>
      <PageHeader
        title="Due for revision"
        description={
          isLoading
            ? undefined
            : total === 0
              ? 'You are all caught up.'
              : `${total} problem${total === 1 ? '' : 's'} to revise. Overdue first.`
        }
      />

      {error && <Banner tone="error">{getApiErrorMessage(error)}</Banner>}

      {!isLoading && !error && total === 0 ? (
        <EmptyState
          title="Nothing due today"
          description="Solved problems with a revision schedule appear here when their date arrives. Set a schedule from the Problems page."
          action={
            <Link to="/problems?solved=true" className="text-sm font-medium text-zinc-700 hover:underline">
              Go to problems
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {(isLoading || (overdue.data && overdue.data.length > 0)) && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-zinc-900">
                Overdue
                {overdue.data && (
                  <span className="ml-2 font-normal text-zinc-500 tabular-nums">{overdue.data.length}</span>
                )}
              </h2>
              <ProblemTable problems={overdue.data} loading={overdue.isLoading} compact empty={null} />
            </section>
          )}
          {(isLoading || (due.data && due.data.length > 0)) && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-zinc-900">
                Due today
                {due.data && (
                  <span className="ml-2 font-normal text-zinc-500 tabular-nums">{due.data.length}</span>
                )}
              </h2>
              <ProblemTable problems={due.data} loading={due.isLoading} compact empty={null} />
            </section>
          )}
        </div>
      )}
    </>
  );
}
