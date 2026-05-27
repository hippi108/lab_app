import type { ReactNode } from 'react';
import Link from 'next/link';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Lab App</p>
              <h1 className="text-2xl font-semibold text-slate-900">研究室プロトコル管理</h1>
            </div>
            <nav className="flex flex-wrap gap-2">
              <Link href="/" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                ホーム
              </Link>
              <Link href="/protocols" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50">
                プロトコル
              </Link>
              <Link href="/calculators" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50">
                計算機
              </Link>
              <Link href="/run" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50">
                Run
              </Link>
              <Link href="/papers" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50">
                論文
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
