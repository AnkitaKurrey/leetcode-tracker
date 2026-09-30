import type { ReactNode } from 'react';
import { IconInbox } from './icons';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        <IconInbox size={18} />
      </div>
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
