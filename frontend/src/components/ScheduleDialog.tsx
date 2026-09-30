import { useState } from 'react';
import type { Problem } from '../services/api';
import { getApiErrorMessage } from '../services/api';
import { useSetRevisionSchedule } from '../hooks/useProblems';
import { useToast } from '../hooks/useToast';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Field } from './ui/Field';

const PRESETS = [3, 7, 14, 30] as const;

interface ScheduleDialogProps {
  problem: Problem;
  onClose: () => void;
}

export default function ScheduleDialog({ problem, onClose }: ScheduleDialogProps) {
  const [days, setDays] = useState<number>(problem.revision_interval_days ?? 7);
  const setRevision = useSetRevisionSchedule();
  const toast = useToast();

  const submit = () => {
    setRevision.mutate(
      { id: problem.id, intervalDays: days },
      {
        onSuccess: (p) => {
          toast.push(`Revision scheduled every ${p.revision_interval_days} days`);
          onClose();
        },
      },
    );
  };

  return (
    <Dialog
      title={problem.revision_interval_days ? 'Change schedule' : 'Set revision schedule'}
      description={problem.title}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button onClick={onClose} disabled={setRevision.isPending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} loading={setRevision.isPending}>
            Save
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-3"
      >
        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-700">Revise every</p>
          <div className="inline-flex rounded-md border border-zinc-300 bg-white p-0.5">
            {PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                aria-pressed={days === d}
                className={`h-7 min-w-[3.5rem] rounded px-3 text-xs font-medium transition-colors ${
                  days === d
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>
        <Field label="Custom interval (days)" htmlFor="sd-days">
          <input
            id="sd-days"
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              setDays(Number.isNaN(n) ? 1 : Math.min(365, Math.max(1, n)));
            }}
            className="control w-32"
          />
        </Field>
        <p className="text-xs text-zinc-500">
          The next revision counts from the last revision or solved date. It is
          never scheduled in the past.
        </p>
        {setRevision.error && (
          <p role="alert" className="text-sm text-red-700">
            {getApiErrorMessage(setRevision.error)}
          </p>
        )}
      </form>
    </Dialog>
  );
}
