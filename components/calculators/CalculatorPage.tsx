'use client';
import { useMemo, useState } from 'react';
import { calculateDilution } from '@/lib/calculations/dilution';
import { calculateMolarity } from '@/lib/calculations/molarity';
import { calculateCustom } from '@/lib/calculations/custom';

const customExample = 'sample_count * reaction_volume * excess_rate';

export function CalculatorPage() {
  const [tab, setTab] = useState<'pcr' | 'dilution' | 'molarity' | 'custom'>('pcr');
  const [dilution, setDilution] = useState({ c1: 10, v1: 1, c2: 1, v2: 10 });
  const [molarity, setMolarity] = useState({ mass: 1, molecular_weight: 180, volume_ml: 100 });
  const [customInputs, setCustomInputs] = useState({ sample_count: 8, reaction_volume: 25, excess_rate: 1.1 });
  const [customExpression, setCustomExpression] = useState(customExample);

  const dilutionResult = useMemo(() => calculateDilution(dilution), [dilution]);
  const molarityResult = useMemo(() => calculateMolarity(molarity), [molarity]);
  const customResult = useMemo(
    () => calculateCustom(customExpression, customInputs),
    [customExpression, customInputs],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {['pcr', 'dilution', 'molarity', 'custom'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value as typeof tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {value === 'pcr' ? 'PCR' : value === 'dilution' ? '希釈' : value === 'molarity' ? 'モル濃度' : 'カスタム'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'pcr' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">PCR 計算</h2>
          <p className="mt-2 text-slate-600">サンプル数と反応成分から合計量を計算します。</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {['sample_count', 'reaction_volume', 'excess_rate', 'buffer_ratio', 'dntp_volume_per_reaction', 'primer_f_volume_per_reaction', 'primer_r_volume_per_reaction', 'polymerase_volume_per_reaction', 'template_volume_per_reaction'].map((key) => (
              <label key={key} className="block text-sm text-slate-700">
                <span className="mb-1 block font-medium text-slate-800">{key}</span>
                <input
                  type="number"
                  value={(customInputs as any)[key] ?? 0}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setCustomInputs((prev) => ({ ...prev, [key]: Number.isNaN(value) ? 0 : value }));
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </label>
            ))}
          </div>
          <div className="mt-6 text-sm text-slate-600">
            <p>この画面では簡易的に計算式を確認できます。プロトコル内に組み込む実装に向けた検証として利用してください。</p>
          </div>
        </div>
      )}

      {tab === 'dilution' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">希釈計算</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {(['c1', 'v1', 'c2', 'v2'] as const).map((key) => (
              <label key={key} className="block text-sm text-slate-700">
                <span className="mb-1 block font-medium text-slate-800">{key}</span>
                <input
                  type="number"
                  value={dilution[key] ?? ''}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setDilution((prev) => ({ ...prev, [key]: Number.isNaN(value) ? undefined : value }));
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </label>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-slate-700">
            <p className="font-medium text-slate-900">結果</p>
            {dilutionResult.error ? (
              <p className="mt-3 text-sm text-red-600">{dilutionResult.error}</p>
            ) : (
              <pre className="mt-3 whitespace-pre-wrap text-sm">{JSON.stringify(dilutionResult.result, null, 2)}</pre>
            )}
          </div>
        </div>
      )}

      {tab === 'molarity' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">モル濃度計算</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {(['mass', 'molecular_weight', 'volume_ml'] as const).map((key) => (
              <label key={key} className="block text-sm text-slate-700">
                <span className="mb-1 block font-medium text-slate-800">{key}</span>
                <input
                  type="number"
                  value={molarity[key]}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setMolarity((prev) => ({ ...prev, [key]: Number.isNaN(value) ? 0 : value }));
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </label>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-slate-700">
            {molarityResult.error ? (
              <p className="text-sm text-red-600">{molarityResult.error}</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p>mol: {Number(molarityResult.moles).toFixed(5)}</p>
                <p>molarity: {Number(molarityResult.molarity).toFixed(5)} M</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'custom' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">カスタム計算</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {Object.entries(customInputs).map(([key, value]) => (
              <label key={key} className="block text-sm text-slate-700">
                <span className="mb-1 block font-medium text-slate-800">{key}</span>
                <input
                  type="number"
                  value={value}
                  onChange={(event) => {
                    const num = Number(event.target.value);
                    setCustomInputs((prev) => ({ ...prev, [key]: Number.isNaN(num) ? 0 : num }));
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </label>
            ))}
          </div>
          <label className="mt-4 block text-sm text-slate-700">
            <span className="mb-1 block font-medium text-slate-800">式</span>
            <textarea
              rows={3}
              value={customExpression}
              onChange={(event) => setCustomExpression(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-slate-700">
            {customResult.error ? (
              <p className="text-sm text-red-600">{customResult.error}</p>
            ) : (
              <p className="text-sm">結果: {String(customResult.result)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
