import { useState } from 'react';
import type { Problem, ReviseResult } from '../services/api';
import { getApiErrorMessage } from '../services/api';
import {
  useDeleteProblem,
  useMarkAsRevised,
  useMarkAsSolved,
} from '../hooks/useProblems';
import { useToast } from '../hooks/useToast';
import {
  daysFromToday,
  formatDateLong,
  formatRelativeDay,
} from '../utils/dateFormatter';
import { Chip, DifficultyBadge, StatusBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { Menu } from './ui/Menu';
import { SkeletonRows, Table, Td, Th } from './ui/Table';
import { IconExternal } from './ui/icons';
import ProblemForm from './ProblemForm';
import ScheduleDialog from './ScheduleDialog';

interface ProblemTableProps {
  problems: Problem[] | undefined;
  loading?: boolean;
  /** Hide the topics and revisions columns. */
  compact?: boolean;
  empty: React.ReactNode;
}

export default function ProblemTable({
  problems,
  loading = false,
  compact = false,
  empty,
}: ProblemTableProps) {
  if (!loading && problems && problems.length === 0) {
    return <>{empty}</>;
  }
  const cols = compact ? 5 : 7;

  return (
    <>
      {/* Small screens: a list. */}
      <div className="sm:hidden divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
        {loading || !problems
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 p-3">
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-zinc-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-100" />
              </div>
            ))
          : problems.map((p) => <ProblemRow key={p.id} problem={p} compact={compact} mobile />)}
      </div>
      {/* Larger screens: the table. */}
      <div className="hidden sm:block">
    <Table>
      <thead>
        <tr>
          <Th className="w-[34%]">Problem</Th>
          <Th>Difficulty</Th>
          {!compact && <Th>Topics</Th>}
          <Th>Status</Th>
          <Th>Next revision</Th>
          {!compact && <Th className="text-right">Revisions</Th>}
          <Th className="w-px">
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      {loading || !problems ? (
        <SkeletonRows rows={compact ? 3 : 6} cols={cols} />
      ) : (
        <tbody>
          {problems.map((p) => (
            <ProblemRow key={p.id} problem={p} compact={compact} />
          ))}
        </tbody>
      )}
    </Table>
      </div>
    </>
  );
}

function ProblemTitle({ problem, className }: { problem: Problem; className: string }) {
  if (!problem.leetcode_url) {
    return (
      <span className={className} title={problem.title}>
        {problem.title}
      </span>
    );
  }
  return (
    <a
      href={problem.leetcode_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover:underline`}
      title={problem.title}
    >
      {problem.title}
    </a>
  );
}

function NextRevision({ problem }: { problem: Problem }) {
  if (!problem.is_solved) return <span className="text-zinc-400">–</span>;
  if (!problem.next_revision_date) {
    return <span className="text-zinc-400">Not scheduled</span>;
  }
  const n = daysFromToday(problem.next_revision_date) ?? 0;
  const tone =
    n < 0 ? 'text-red-700' : n === 0 ? 'text-amber-700' : 'text-zinc-700';
  return (
    <span className={`tabular-nums ${tone}`} title={formatDateLong(problem.next_revision_date)}>
      {n < 0 ? `${-n} day${n === -1 ? '' : 's'} overdue` : formatRelativeDay(problem.next_revision_date)}
      {problem.revision_interval_days && (
        <span className="text-zinc-400"> · every {problem.revision_interval_days}d</span>
      )}
    </span>
  );
}

function ProblemRow({
  problem,
  compact,
  mobile = false,
}: {
  problem: Problem;
  compact: boolean;
  mobile?: boolean;
}) {
  const [dialog, setDialog] = useState<'edit' | 'schedule' | 'delete' | null>(null);
  const markSolved = useMarkAsSolved();
  const markRevised = useMarkAsRevised();
  const remove = useDeleteProblem();
  const toast = useToast();

  const fail = (err: unknown) => toast.push(getApiErrorMessage(err), 'error');

  const onSolve = () =>
    markSolved.mutate(problem.id, {
      onSuccess: () => toast.push('Marked as solved'),
      onError: fail,
    });
  const onRevise = (result: ReviseResult = 'ok') =>
    markRevised.mutate(
      { id: problem.id, result },
      {
        onSuccess: (p) =>
          toast.push(
            p.next_revision_date
              ? `Revised. Next revision ${formatRelativeDay(p.next_revision_date)}`
              : 'Revised',
          ),
        onError: fail,
      },
    );
  const onDelete = () =>
    remove.mutate(problem.id, {
      onSuccess: () => {
        toast.push('Problem deleted');
        setDialog(null);
      },
      onError: fail,
    });

  const needsRevision = problem.status === 'DUE' || problem.status === 'OVERDUE';

  let primary: React.ReactNode = null;
  if (!problem.is_solved) {
    primary = (
      <Button size="sm" onClick={onSolve} loading={markSolved.isPending}>
        Mark solved
      </Button>
    );
  } else if (needsRevision) {
    primary = (
      <Button size="sm" variant="primary" onClick={() => onRevise('ok')} loading={markRevised.isPending}>
        Mark revised
      </Button>
    );
  } else if (!problem.revision_interval_days) {
    primary = (
      <Button size="sm" onClick={() => setDialog('schedule')}>
        Set schedule
      </Button>
    );
  }

  const topics = problem.topics ?? [];

  const menu = (
    <Menu
      items={[
        { label: 'Edit', onSelect: () => setDialog('edit') },
        {
          label: 'Revised: easy (skip ahead)',
          onSelect: () => onRevise('easy'),
          disabled: !needsRevision,
        },
        {
          label: 'Revised: hard (back to 1 week)',
          onSelect: () => onRevise('hard'),
          disabled: !needsRevision,
        },
        {
          label: problem.revision_interval_days ? 'Change schedule' : 'Set schedule',
          onSelect: () => setDialog('schedule'),
          disabled: !problem.is_solved,
        },
        { label: 'Delete', onSelect: () => setDialog('delete'), danger: true },
      ]}
    />
  );

  const dialogs = (
    <>
      {dialog === 'edit' && <ProblemForm problem={problem} onClose={() => setDialog(null)} />}
      {dialog === 'schedule' && <ScheduleDialog problem={problem} onClose={() => setDialog(null)} />}
      {dialog === 'delete' && (
        <ConfirmDialog
          title="Delete problem"
          message={`"${problem.title}" and its revision history will be permanently deleted.`}
          confirmLabel="Delete"
          danger
          loading={remove.isPending}
          onConfirm={onDelete}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );

  if (mobile) {
    return (
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <ProblemTitle problem={problem} className="block truncate font-medium text-zinc-900" />
            {problem.companies && problem.companies.length > 0 && (
              <p className="truncate text-xs text-zinc-500">{problem.companies.join(', ')}</p>
            )}
          </div>
          {menu}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <DifficultyBadge difficulty={problem.difficulty} />
          <StatusBadge status={problem.status} />
          {!compact && topics.slice(0, 2).map((t) => <Chip key={t}>{t}</Chip>)}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <NextRevision problem={problem} />
          {primary}
        </div>
        {dialogs}
      </div>
    );
  }

  return (
    <>
      <tr className="group hover:bg-zinc-50/80">
        <Td className="max-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <ProblemTitle problem={problem} className="truncate font-medium text-zinc-900" />
            {problem.leetcode_url && (
              <IconExternal size={13} className="shrink-0 text-zinc-400 opacity-0 group-hover:opacity-100" />
            )}
          </div>
          {problem.companies && problem.companies.length > 0 && (
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {problem.companies.join(', ')}
            </p>
          )}
        </Td>
        <Td>
          <DifficultyBadge difficulty={problem.difficulty} />
        </Td>
        {!compact && (
          <Td>
            {topics.length === 0 ? (
              <span className="text-zinc-400">–</span>
            ) : (
              <div className="flex items-center gap-1 whitespace-nowrap" title={topics.join(', ')}>
                {topics.slice(0, 2).map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
                {topics.length > 2 && (
                  <span className="text-2xs text-zinc-500">+{topics.length - 2}</span>
                )}
              </div>
            )}
          </Td>
        )}
        <Td>
          <StatusBadge status={problem.status} />
        </Td>
        <Td className="whitespace-nowrap">
          <NextRevision problem={problem} />
        </Td>
        {!compact && (
          <Td className="text-right tabular-nums text-zinc-700">
            {problem.revision_count || <span className="text-zinc-400">0</span>}
          </Td>
        )}
        <Td className="whitespace-nowrap">
          <div className="flex items-center justify-end gap-1">
            {primary}
            {menu}
          </div>
        </Td>
      </tr>
      {dialogs}
    </>
  );
}
