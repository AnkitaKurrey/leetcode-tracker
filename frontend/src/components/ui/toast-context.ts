import { createContext } from 'react';

export type ToastKind = 'success' | 'error';

export interface ToastApi {
  push: (message: string, kind?: ToastKind) => void;
}

export const ToastContext = createContext<ToastApi>({ push: () => {} });
