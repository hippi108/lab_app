'use client';
import { useMemo, useState } from 'react';
import { exportProtocolPdf } from '@/lib/pdf/exportProtocolPdf';
import type { Protocol } from '@/types/protocol';
import type { PCRInputs } from '@/types/calculation';
import { calculatePcr } from '@/lib/calculations/pcr';
import { Timer } from '@/components/timers/Timer';
import { Counter } from '@/components/counters/Counter';

const defaultInputs: PCRInputs = {
  sample_count: 8,
  reaction_volume: 25,
  excess_rate: 1.1,
  buffer_ratio: 1,
  dntp_volume_per_reaction: 0.5,
  primer_f_volume_per_reaction: 0.5,
  primer_r_volume_per_reaction: 0.5,
  polymerase_volume_per_reaction: 0.25,
  template_volume_per_reaction: 2,
};

export function ProtocolDetailClient({ protocol }: { protocol: Protocol }) {
  const [inputs, setInputs] = useState<PCRInputs>(defaultInputs);
  const results = useMemo(() => calculatePcr(inputs), [inputs]);

  return (
    <div className="space-y-6 px-6 py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">{protocol.tags.join(' ・ ')}</p>
            <h1 className="text-3xl font-semibold text-slate-900">{protocol.title}</h1>
          </div>
          <button
            type="button"
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            onClick={() => exportProtocolPdf(protocol)}
          >
            PDF 出力
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">説明</h2>
            <p className="mt-3 text-slate-600">{protocol.description}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">試薬リスト</h2>
            <ul className="mt-4 space-y-3">
              {protocol.blocks
                .filter((block) => block.type === 'materials')
                .flatMap((block) => block.items)
                .map((item) => (
                  <li key={`${item.name}-${item.amount}`} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <strong>{item.name}</strong> — {item.amount}
                  </li>
                ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">手順</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-700">
              {protocol.blocks.filter((block) => block.type === 'step').map((block) => (
                <li key={block.id}>{block.step}</li>
              ))}
            </ol>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">変数</h2>
            <div className="mt-4 space-y-4">
              {Object.entries(inputs).map(([key, value]) => (
                <label key={key} className="block text-sm text-slate-700">
                  <span className="mb-1 block font-medium text-slate-800">{key}</span>
                  <input
                    type="number"
                    value={value}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    onChange={(event) => {
                      const num = Number(event.target.value);
                      setInputs((prev) => ({ ...prev, [key]: Number.isNaN(num) ? 0 : num }));
                    }}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">計算結果</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-700">
              {Object.entries(results).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <dt className="text-slate-700">{key}</dt>
                  <dd className="font-semibold text-slate-900">{Number(value).toFixed(2)} µL</dd>
                </div>
              ))}
            </dl>
          </div>

          <Timer durationSeconds={300} />
          <Counter initialValue={0} />
        </aside>
      </div>
    </div>
  );
}
