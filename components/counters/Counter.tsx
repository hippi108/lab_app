'use client';
import { useState } from 'react';

export function Counter({ initialValue = 0 }: { initialValue?: number }) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">Counter</p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          onClick={() => setValue((cur) => cur - 1)}
        >
          -
        </button>
        <span className="min-w-[3rem] text-center text-2xl font-semibold text-slate-900">{value}</span>
        <button
          type="button"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          onClick={() => setValue((cur) => cur + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
