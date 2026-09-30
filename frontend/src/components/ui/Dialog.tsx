import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from './icons';
import { IconButton } from './Button';

interface DialogProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

export function Dialog({
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const first = panelRef.current?.querySelector<HTMLElement>(
      'input:not([type=hidden]), select, textarea, button:not([data-dialog-close])',
    );
    first?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/40 p-4 sm:p-8 animate-overlay-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`w-full ${sizes[size]} rounded-lg bg-white shadow-dialog mt-8 animate-panel-in`}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 border-b border-zinc-200">
          <div>
            <h2 id="dialog-title" className="text-base font-semibold text-zinc-900">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
            )}
          </div>
          <IconButton label="Close" onClick={onClose} data-dialog-close>
            <IconClose />
          </IconButton>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-zinc-200 bg-zinc-50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
