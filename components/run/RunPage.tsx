'use client';
import { useState } from 'react';
import { Timer } from '@/components/timers/Timer';
import { Counter } from '@/components/counters/Counter';

export function RunPage() {
  const [sampleCount, setSampleCount] = useState(8);
  const [note, setNote] = useState('');

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-slate-900">Run モード</h2>
        <p className="mt-2 text-slate-600">実験中に確認・計算・メモをまとめて使います。</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <label className="block text-sm text-slate-700">
              <span className="mb-2 block font-medium text-slate-800">サンプル数</span>
              <input
                type="number"
                value={sampleCount}
                onChange={(event) => setSampleCount(Number(event.target.value))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
            </label>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">メモ</h3>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-4 min-h-[180px] w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none focus:border-slate-400"
              placeholder="実験メモを入力"
            />
          </div>
        </div>

        <div className="space-y-6">
          <Timer durationSeconds={300} />
          <Counter initialValue={0} />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">確認</h3>
            <p className="mt-3 text-sm text-slate-600">サンプル数: {sampleCount} 本</p>
          </div>
        </div>
      </div>
    </div>
  );
}
