'use client';
import { useEffect, useMemo, useState } from 'react';
import { Timer } from '@/components/timers/Timer';
import { Counter } from '@/components/counters/Counter';
import { getProtocols } from '@/lib/repositories/protocolRepository';
import { evaluateCalculationBlock } from '@/lib/calculations/evaluateCalculationBlock';
import type { Protocol, CalculationBlock } from '@/types/protocol';

export function RunPage() {
  const [sampleCount, setSampleCount] = useState(8);
  const [note, setNote] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [protocol, setProtocol] = useState<Protocol | null>(null);

  useEffect(() => {
    const known = getProtocols();
    setProtocol(known[0] ?? null);
  }, []);

  const checklist = useMemo(() => {
    if (!protocol) return [];
    return protocol.blocks.filter((block) => block.type === 'checklist');
  }, [protocol]);

  const calculation = useMemo(() => {
    if (!protocol) return null;
    return protocol.blocks.find((block) => block.type === 'calculation') as CalculationBlock | undefined;
  }, [protocol]);

  const calculationResult = useMemo(() => {
    if (!calculation) return null;
    const inputValues: Record<string, number> = {};
    calculation.inputs.forEach((input) => {
      inputValues[input.key] = Number(input.defaultValue ?? 0);
    });
    inputValues.sample_count = sampleCount;
    const result = evaluateCalculationBlock(calculation, inputValues);
    return result;
  }, [calculation, sampleCount]);

  const materialBlocks = useMemo(() => {
    if (!protocol) return [];
    return protocol.blocks.filter((block) => block.type === 'materials');
  }, [protocol]);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Run モード</p>
            <h2 className="text-2xl font-semibold text-slate-900">{protocol?.title ?? '実験 Run'}</h2>
            <p className="mt-2 text-slate-600">{protocol?.description ?? '実験中に見る・計算する・測る・記録するための画面です。'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">チェックリスト</h3>
                <p className="mt-1 text-sm text-slate-600">実験手順の進捗をチェックできます。</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">実験中</span>
            </div>
            <div className="mt-4 space-y-3">
              {checklist.length === 0 ? (
                <p className="text-sm text-slate-600">チェックリストがありません。</p>
              ) : (
                checklist.flatMap((block) =>
                  block.items.map((item) => (
                    <label key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={checkedItems[item.id] ?? !!item.checked}
                        onChange={(event) => setCheckedItems((prev) => ({ ...prev, [item.id]: event.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900"
                      />
                      <span className="text-sm text-slate-800">{item.text}</span>
                    </label>
                  )),
                )
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">試薬 / 材料</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {materialBlocks.length === 0 ? (
                <p className="text-sm text-slate-600">試薬リストがありません。</p>
              ) : (
                materialBlocks.flatMap((block) =>
                  block.items.map((item) => (
                    <div key={`${item.name}-${item.amount}`} className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="mt-1 text-slate-600">{item.amount}</div>
                    </div>
                  )),
                )
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">実験メモ</h3>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-4 min-h-[160px] w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none focus:border-slate-400"
              placeholder="測定結果や気づきを入力"
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">マイ実験ツール</h3>
            <div className="mt-4 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>サンプル数</span>
                  <span className="text-slate-900 font-semibold">{sampleCount}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={48}
                  value={sampleCount}
                  onChange={(event) => setSampleCount(Number(event.target.value))}
                  className="mt-3 w-full"
                />
              </div>
              <Timer durationSeconds={300} />
              <Counter initialValue={0} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">計算結果</h3>
            {calculationResult?.error ? (
              <p className="mt-4 text-sm text-red-600">{calculationResult.error}</p>
            ) : calculationResult ? (
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                {Object.entries(calculationResult.outputs ?? {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span>{key}</span>
                    <span className="font-semibold text-slate-900">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">計算ブロックがありません。</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
