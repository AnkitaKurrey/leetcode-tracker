import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProblems } from '../hooks/useProblems';
import type { ProblemFilters } from '../hooks/useProblems';
import { Difficulty, ProblemStatus as PS, getApiErrorMessage } from '../services/api';
import ProblemTable from './ProblemTable';
import ProblemForm from './ProblemForm';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { Banner } from './ui/Banner';
import { EmptyState } from './ui/EmptyState';
import { IconPlus, IconSearch } from './ui/icons';

export default function ProblemList() {
  const [params, setParams] = useSearchParams();
  const [showAdd, setShowAdd] = useState(params.get('new') === '1');
  const [search, setSearch] = useState(params.get('q') ?? '');

  const difficulty = params.get('difficulty') ?? '';
  const status = params.get('status') ?? '';
  const solved = params.get('solved') ?? '';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('new');
    setParams(next, { replace: true });
  };

  // Debounce the search box into the URL so it is shareable and survives reloads.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if ((params.get('q') ?? '') !== search) setParam('q', search);
    }, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filters: ProblemFilters = {};
  if (difficulty) filters.difficulty = difficulty;
  if (status) filters.status = status;
  if (solved) filters.is_solved = solved === 'true';

  const { data: problems, isLoading, error } = useProblems(filters);

  const visible = useMemo(() => {
    if (!problems) return problems;
    const q = search.trim().toLowerCase();
    if (!q) return problems;
    return problems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.topics?.some((t) => t.toLowerCase().includes(q)) ||
        p.companies?.some((c) => c.toLowerCase().includes(q)),
    );
  }, [problems, search]);

  const hasFilters = Boolean(difficulty || status || solved || search);

  // Nudge once: solved problems exist but none has a revision schedule yet.
  const unscheduledSolved = problems?.filter((p) => p.is_solved && !p.revision_interval_days) ?? [];
  const showScheduleHint =
    !hasFilters &&
    unscheduledSolved.length > 0 &&
    !problems?.some((p) => p.revision_interval_days);
  const clearFilters = () => {
    setSearch('');
    setParams(new URLSearchParams(), { replace: true });
  };

  return (
    <>
      <PageHeader
        title="Problems"
        description={
          problems
            ? `${visible?.length ?? 0}${hasFilters ? ` of ${problems.length}` : ''} problem${problems.length === 1 ? '' : 's'}`
            : undefined
        }
        actions={
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            <IconPlus size={14} />
            Add problem
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <IconSearch size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            aria-label="Search problems"
            placeholder="Search title, topic, company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="control pl-8"
          />
        </div>
        <select aria-label="Difficulty" value={difficulty} onChange={(e) => setParam('difficulty', e.target.value)} className="control w-auto">
          <option value="">Any difficulty</option>
          <option value={Difficulty.EASY}>Easy</option>
          <option value={Difficulty.MEDIUM}>Medium</option>
          <option value={Difficulty.HARD}>Hard</option>
        </select>
        <select aria-label="Solved" value={solved} onChange={(e) => setParam('solved', e.target.value)} className="control w-auto">
          <option value="">Solved or not</option>
          <option value="true">Solved</option>
          <option value="false">Unsolved</option>
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setParam('status', e.target.value)} className="control w-auto">
          <option value="">Any status</option>
          <option value={PS.SOLVED}>Solved</option>
          <option value={PS.REVISED}>Revised</option>
          <option value={PS.DUE}>Due today</option>
          <option value={PS.OVERDUE}>Overdue</option>
        </select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {showScheduleHint && (
        <Banner tone="info">
          <span className="font-medium">Next step:</span> set a revision interval on a
          solved problem so it shows up on the Due page when it is time to revisit it.
          Use <span className="font-medium">Set schedule</span> on the row.
        </Banner>
      )}

      {error ? (
        <Banner tone="error">{getApiErrorMessage(error)}</Banner>
      ) : (
        <ProblemTable
          problems={visible}
          loading={isLoading}
          empty={
            hasFilters ? (
              <EmptyState
                title="No matching problems"
                description="Try a different search or clear the filters."
                action={<Button onClick={clearFilters}>Clear filters</Button>}
              />
            ) : (
              <EmptyState
                title="No problems yet"
                description="Add the first problem you want to track and revise."
                action={
                  <Button variant="primary" onClick={() => setShowAdd(true)}>
                    <IconPlus size={14} />
                    Add problem
                  </Button>
                }
              />
            )
          }
        />
      )}

      {showAdd && (
        <ProblemForm
          onClose={() => {
            setShowAdd(false);
            if (params.get('new')) setParam('new', '');
          }}
        />
      )}
    </>
  );
}
