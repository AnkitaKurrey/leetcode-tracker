import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-zinc-900 text-white border border-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 disabled:border-zinc-400',
  secondary:
    'bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400 disabled:text-zinc-400',
  ghost:
    'bg-transparent text-zinc-700 border border-transparent hover:bg-zinc-100 disabled:text-zinc-400',
  danger:
    'bg-white text-red-700 border border-zinc-300 hover:bg-red-50 hover:border-red-300 disabled:text-zinc-400',
};

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-8 px-3 text-sm gap-2',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium select-none transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          className="inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
