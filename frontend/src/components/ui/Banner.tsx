import type { ReactNode } from 'react';
import { IconAlert, IconBell } from './icons';

interface BannerProps {
  tone: 'info' | 'warning' | 'error';
  children: ReactNode;
  actions?: ReactNode;
}

const tones = {
  info: { cls: 'border-zinc-200 bg-white text-zinc-700', icon: <IconBell className="text-zinc-500" /> },
  warning: { cls: 'border-amber-200 bg-amber-50 text-amber-900', icon: <IconAlert className="text-amber-600" /> },
  error: { cls: 'border-red-200 bg-red-50 text-red-900', icon: <IconAlert className="text-red-600" /> },
};

export function Banner({ tone, children, actions }: BannerProps) {
  const t = tones[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`mb-4 flex flex-wrap items-center gap-3 rounded-md border px-3 py-2 text-sm ${t.cls}`}
    >
      <span className="shrink-0">{t.icon}</span>
      <div className="flex-1 min-w-[12rem]">{children}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
