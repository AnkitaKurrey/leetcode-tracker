import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/Badge';

export const STEPS = [
  {
    title: 'Add a problem',
    body: 'Paste the LeetCode link or just type a title. Difficulty, topics and notes are optional.',
  },
  {
    title: 'Mark it solved',
    body: 'When you have solved it, mark it solved. Unsolved problems stay on your list.',
  },
  {
    title: 'Set a revision interval',
    body: 'Choose how often to revisit it: every 3, 7, 14 or 30 days. The next date is calculated for you.',
  },
  {
    title: 'Revise when it comes due',
    body: 'Due and overdue problems appear on the Due page. Mark them revised and the next date rolls forward.',
  },
] as const;

const STATUSES = [
  { status: null, meaning: 'Added but not solved yet.' },
  { status: 'SOLVED', meaning: 'Solved. No revision scheduled, or the first one is still ahead.' },
  { status: 'DUE', meaning: 'A revision is due today.' },
  { status: 'OVERDUE', meaning: 'The revision date has passed.' },
  { status: 'REVISED', meaning: 'Revised at least once and the next revision is ahead.' },
] as const;

function Steps({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={compact ? 'space-y-2' : 'space-y-3'}>
      {STEPS.map((s, i) => (
        <li key={s.title} className="flex gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-2xs font-semibold text-white tabular-nums">
            {i + 1}
          </span>
          <div>
            <p className="text-sm font-medium text-zinc-900">{s.title}</p>
            <p className="text-sm text-zinc-600">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Shown on Overview when the user has no problems yet. */
export function GettingStarted({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white">
      <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-5 lg:p-8">
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold text-zinc-900">Start with one problem</h2>
          <p className="mt-1 text-sm text-zinc-600">
            This app keeps a list of LeetCode problems and reminds you to revise
            the ones you have solved, on a schedule you choose.
          </p>
          <Button variant="primary" className="mt-4" onClick={onAdd}>
            Add your first problem
          </Button>
        </div>
        <div className="lg:col-span-3">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">How it works</p>
          <Steps />
        </div>
      </div>
    </div>
  );
}

export function HowItWorksDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog
      title="How it works"
      onClose={onClose}
      footer={
        <Button variant="primary" onClick={onClose}>
          Got it
        </Button>
      }
    >
      <Steps compact />
      <div className="mt-5 border-t border-zinc-200 pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Statuses</p>
        <dl className="space-y-1.5">
          {STATUSES.map((s) => (
            <div key={s.status ?? 'none'} className="flex items-center gap-3 text-sm">
              <dt className="w-24 shrink-0">
                <StatusBadge status={s.status} />
              </dt>
              <dd className="text-zinc-600">{s.meaning}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Dialog>
  );
}
