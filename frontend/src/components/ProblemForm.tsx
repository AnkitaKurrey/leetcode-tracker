import { useState } from 'react';
import type { Problem, CreateProblemDto } from '../services/api';
import { Difficulty, getApiErrorMessage } from '../services/api';
import { useCreateProblem, useUpdateProblem } from '../hooks/useProblems';
import { useToast } from '../hooks/useToast';
import { toDateInputValue, todayInputValue } from '../utils/dateFormatter';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Field } from './ui/Field';

interface ProblemFormProps {
  problem?: Problem;
  onClose: () => void;
}

const REVISION_INTERVALS = [3, 7, 14, 30] as const;

interface FormState {
  title: string;
  leetcode_url: string;
  /** '' = not set */
  difficulty: Difficulty | '';
  topicsInput: string;
  companiesInput: string;
  notes: string;
  is_solved: boolean;
  solved_date: string;
  revision_interval_days: string;
  next_revision_date: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  leetcode_url: '',
  difficulty: '',
  topicsInput: '',
  companiesInput: '',
  notes: '',
  is_solved: false,
  solved_date: '',
  revision_interval_days: '',
  next_revision_date: '',
};

function fromProblem(problem?: Problem): FormState {
  if (!problem) return EMPTY_FORM;
  return {
    title: problem.title,
    leetcode_url: problem.leetcode_url ?? '',
    difficulty: problem.difficulty ?? '',
    topicsInput: problem.topics?.join(', ') ?? '',
    companiesInput: problem.companies?.join(', ') ?? '',
    notes: problem.notes ?? '',
    is_solved: problem.is_solved,
    solved_date: toDateInputValue(problem.solved_date),
    revision_interval_days: problem.revision_interval_days
      ? String(problem.revision_interval_days)
      : '',
    next_revision_date: toDateInputValue(problem.next_revision_date),
  };
}

function splitList(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function toDto(form: FormState, originalNext: string): CreateProblemDto {
  const dto: CreateProblemDto = {
    title: form.title.trim() || null,
    leetcode_url: form.leetcode_url.trim() || null,
    difficulty: form.difficulty || null,
    topics: splitList(form.topicsInput),
    companies: splitList(form.companiesInput),
    notes: form.notes.trim(),
    is_solved: form.is_solved,
  };
  if (form.is_solved) {
    dto.solved_date = form.solved_date || todayInputValue();
    dto.revision_interval_days = form.revision_interval_days
      ? Number(form.revision_interval_days)
      : null;
    if (form.next_revision_date) {
      dto.next_revision_date = form.next_revision_date;
    } else if (originalNext) {
      dto.next_revision_date = null; // cleared: recalculate server-side
    }
  }
  return dto;
}

export default function ProblemForm({ problem, onClose }: ProblemFormProps) {
  const [form, setForm] = useState<FormState>(() => fromProblem(problem));
  const [localError, setLocalError] = useState<string | null>(null);
  const createProblem = useCreateProblem();
  const updateProblem = useUpdateProblem();
  const toast = useToast();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() && !form.leetcode_url.trim()) {
      setLocalError('Enter a title or paste the LeetCode link.');
      return;
    }
    setLocalError(null);
    const dto = toDto(form, toDateInputValue(problem?.next_revision_date));
    if (problem) {
      updateProblem.mutate(
        { id: problem.id, data: dto },
        {
          onSuccess: () => {
            toast.push('Problem updated');
            onClose();
          },
        },
      );
    } else {
      createProblem.mutate(dto, {
        onSuccess: () => {
          toast.push('Problem added');
          onClose();
        },
      });
    }
  };

  const isLoading = createProblem.isPending || updateProblem.isPending;
  const mutationError = problem ? updateProblem.error : createProblem.error;
  const errorMessage = localError ?? (mutationError ? getApiErrorMessage(mutationError) : null);
  const formId = 'problem-form';

  return (
    <Dialog
      title={problem ? 'Edit problem' : 'Add problem'}
      description={
        problem
          ? undefined
          : 'Only a title or a LeetCode link is needed. Everything else is optional.'
      }
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            loading={isLoading}
          >
            {problem ? 'Save changes' : 'Add problem'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-5">
        <section className="space-y-3">
          <Field label="Title" htmlFor="pf-title" hint="Optional if you paste the link below; it is taken from the URL.">
            <input
              id="pf-title"
              type="text"
              maxLength={255}
              autoComplete="off"
              placeholder="Two Sum"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="control"
            />
          </Field>
          <Field label="LeetCode URL" htmlFor="pf-url">
            <input
              id="pf-url"
              type="url"
              autoComplete="off"
              placeholder="https://leetcode.com/problems/two-sum/"
              value={form.leetcode_url}
              onChange={(e) => set('leetcode_url', e.target.value)}
              className="control"
            />
          </Field>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Difficulty" htmlFor="pf-difficulty">
            <select
              id="pf-difficulty"
              value={form.difficulty}
              onChange={(e) => set('difficulty', e.target.value as Difficulty | '')}
              className="control"
            >
              <option value="">Not set</option>
              <option value={Difficulty.EASY}>Easy</option>
              <option value={Difficulty.MEDIUM}>Medium</option>
              <option value={Difficulty.HARD}>Hard</option>
            </select>
          </Field>
          <Field label="Topics" htmlFor="pf-topics" hint="Comma-separated">
            <input
              id="pf-topics"
              type="text"
              autoComplete="off"
              value={form.topicsInput}
              onChange={(e) => set('topicsInput', e.target.value)}
              placeholder="Array, Hash Table"
              className="control"
            />
          </Field>
          <Field label="Companies" htmlFor="pf-companies" hint="Comma-separated">
            <input
              id="pf-companies"
              type="text"
              autoComplete="off"
              value={form.companiesInput}
              onChange={(e) => set('companiesInput', e.target.value)}
              placeholder="Google, Amazon"
              className="control"
            />
          </Field>
        </section>

        <Field label="Notes" htmlFor="pf-notes">
          <textarea
            id="pf-notes"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            placeholder="Approach, pitfalls, complexity..."
            className="control"
          />
        </Field>

        <section className="rounded-md border border-zinc-200 bg-zinc-50/60 p-3">
          <label className="flex items-center gap-2 text-sm text-zinc-800">
            <input
              type="checkbox"
              id="pf-solved"
              checked={form.is_solved}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  is_solved: e.target.checked,
                  solved_date:
                    e.target.checked && !prev.solved_date
                      ? todayInputValue()
                      : prev.solved_date,
                }))
              }
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-blue-500"
            />
            <span className="font-medium">Solved</span>
            {!form.is_solved && (
              <span className="text-zinc-500">
                Tick once solved to set a solved date and a revision schedule.
              </span>
            )}
          </label>

          {form.is_solved && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Solved on" htmlFor="pf-solved-date">
                <input
                  id="pf-solved-date"
                  type="date"
                  max={todayInputValue()}
                  value={form.solved_date}
                  onChange={(e) => set('solved_date', e.target.value)}
                  className="control"
                />
              </Field>
              <Field label="Revise every" htmlFor="pf-interval" hint="Shows on the Due page when it is time">
                <select
                  id="pf-interval"
                  value={form.revision_interval_days}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      revision_interval_days: e.target.value,
                      next_revision_date: '',
                    }))
                  }
                  className="control"
                >
                  <option value="">No schedule</option>
                  {REVISION_INTERVALS.map((d) => (
                    <option key={d} value={d}>
                      {d} days
                    </option>
                  ))}
                  {form.revision_interval_days &&
                    !REVISION_INTERVALS.some(
                      (d) => String(d) === form.revision_interval_days,
                    ) && (
                      <option value={form.revision_interval_days}>
                        {form.revision_interval_days} days
                      </option>
                    )}
                </select>
              </Field>
              {form.revision_interval_days && (
                <Field
                  label="Next revision"
                  htmlFor="pf-next"
                  hint="Blank = calculated from interval"
                >
                  <input
                    id="pf-next"
                    type="date"
                    value={form.next_revision_date}
                    onChange={(e) => set('next_revision_date', e.target.value)}
                    className="control"
                  />
                </Field>
              )}
            </div>
          )}
        </section>

        {errorMessage && (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {errorMessage}
          </p>
        )}
      </form>
    </Dialog>
  );
}
