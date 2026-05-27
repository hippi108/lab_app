import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-soft ${className}`}>{children}</div>;
}
