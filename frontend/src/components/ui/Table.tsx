import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({
  className = '',
  children,
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={`h-9 px-3 text-left text-xs font-medium text-zinc-500 border-b border-zinc-200 bg-zinc-50 whitespace-nowrap ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({
  className = '',
  children,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-3 py-2 align-middle border-b border-zinc-100 ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}

export function SkeletonRows({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <Td key={c}>
              <div
                className="h-3.5 rounded bg-zinc-100 animate-pulse"
                style={{ width: `${c === 0 ? 60 : 35 + ((r * 7 + c * 13) % 30)}%` }}
              />
            </Td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
