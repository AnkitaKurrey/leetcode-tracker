import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './Button';
import { IconMore } from './icons';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface MenuProps {
  items: MenuItem[];
  label?: string;
  trigger?: ReactNode;
  align?: 'left' | 'right';
}

const MENU_WIDTH = 176;

export function Menu({ items, label = 'More actions', trigger, align = 'right' }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const estimatedHeight = items.length * 32 + 8;

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const left = align === 'right' ? r.right - MENU_WIDTH : r.left;
    const below = r.bottom + 4;
    const top =
      below + estimatedHeight > window.innerHeight - 8
        ? Math.max(8, r.top - 4 - estimatedHeight)
        : below;
    setPos({ top, left: Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8)) });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !triggerRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <span ref={triggerRef} className="inline-flex" onClick={toggle}>
        {trigger ?? (
          <IconButton label={label} aria-haspopup="menu" aria-expanded={open}>
            <IconMore />
          </IconButton>
        )}
      </span>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: MENU_WIDTH }}
            className="fixed z-50 rounded-md bg-white py-1 shadow-menu animate-panel-in"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={`block w-full px-3 py-1.5 text-left text-sm disabled:opacity-50 ${
                  item.danger ? 'text-red-700 hover:bg-red-50' : 'text-zinc-800 hover:bg-zinc-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
