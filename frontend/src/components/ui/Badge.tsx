import type { Difficulty, ProblemStatus } from '../../services/api';

/**
 * Status and difficulty badges. Colour is always paired with a text label and
 * a dot so meaning never depends on hue alone.
 */

const STATUS: Record<ProblemStatus, { label: string; cls: string; dot: string }> = {
  SOLVED: { label: 'Solved', cls: 'text-zinc-700 bg-zinc-50 border-zinc-200', dot: 'bg-zinc-500' },
  REVISED: { label: 'Revised', cls: 'text-blue-800 bg-blue-50 border-blue-200', dot: 'bg-blue-600' },
  DUE: { label: 'Due today', cls: 'text-amber-800 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  OVERDUE: { label: 'Overdue', cls: 'text-red-800 bg-red-50 border-red-200', dot: 'bg-red-600' },
};

const DIFFICULTY: Record<Difficulty, { label: string; cls: string }> = {
  EASY: { label: 'Easy', cls: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  MEDIUM: { label: 'Medium', cls: 'text-amber-800 bg-amber-50 border-amber-200' },
  HARD: { label: 'Hard', cls: 'text-red-800 bg-red-50 border-red-200' },
};

const base =
  'inline-flex items-center gap-1.5 h-5 px-1.5 rounded border text-2xs font-medium whitespace-nowrap';

export function StatusBadge({ status }: { status: ProblemStatus | null }) {
  if (!status) {
    return (
      <span className={`${base} text-zinc-500 bg-white border-zinc-200`}>
        <span className="h-1.5 w-1.5 rounded-full border border-zinc-400" />
        Unsolved
      </span>
    );
  }
  const s = STATUS[status];
  return (
    <span className={`${base} ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty | null }) {
  if (!difficulty) {
    return <span className="text-zinc-400">–</span>;
  }
  const d = DIFFICULTY[difficulty];
  return <span className={`${base} ${d.cls}`}>{d.label}</span>;
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center h-5 px-1.5 rounded bg-zinc-100 text-zinc-700 text-2xs whitespace-nowrap">
      {children}
    </span>
  );
}
