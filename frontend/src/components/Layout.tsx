import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ConnectionStatus from './ConnectionStatus';
import NotificationBanner from './NotificationBanner';
import { useDashboard } from '../hooks/useProblems';
import { HowItWorksDialog } from './HowItWorks';
import { IconHelp } from './ui/icons-extra';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/problems', label: 'Problems' },
  { to: '/due', label: 'Due' },
  { to: '/progress', label: 'Progress' },
];

export default function Layout({ children }: LayoutProps) {
  const [showHelp, setShowHelp] = useState(false);
  const { data: dashboard } = useDashboard();
  const attention = (dashboard?.stats.due ?? 0) + (dashboard?.stats.overdue ?? 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-3 px-3 sm:gap-6 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-900 text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M7 4v16h10" />
              </svg>
            </span>
            <span className="hidden sm:inline">LeetCode Tracker</span>
          </NavLink>
          <nav className="-mb-px flex h-full items-stretch gap-1 overflow-x-auto" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 border-b-2 px-1.5 sm:px-2 text-sm transition-colors ${
                    isActive
                      ? 'border-zinc-900 font-medium text-zinc-900'
                      : 'border-transparent text-zinc-500 hover:text-zinc-900'
                  }`
                }
              >
                {item.label}
                {item.to === '/due' && attention > 0 && (
                  <span className="rounded-full bg-zinc-900 px-1.5 text-2xs font-medium leading-4 text-white tabular-nums">
                    {attention}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="ml-auto inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-1.5 sm:px-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <IconHelp size={15} />
            <span className="hidden sm:inline">How it works</span>
          </button>
        </div>
      </header>
      {showHelp && <HowItWorksDialog onClose={() => setShowHelp(false)} />}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <ConnectionStatus />
        <NotificationBanner />
        {children}
      </main>
    </div>
  );
}
