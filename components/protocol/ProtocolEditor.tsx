'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProtocolById, saveProtocol, getProtocols } from '@/lib/repositories/protocolRepository';
import type { Protocol, ProtocolBlock, CalculationBlock } from '@/types/protocol';
import { evaluateCalculationBlock } from '@/lib/calculations/evaluateCalculationBlock';
import { calculatePcr } from '@/lib/calculations/pcr';

type Props = { id: string };

function uid(prefix = '') {
  return `${prefix}${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function BlockRow({ block, index, onEdit, onRemove, onMove }: { block: ProtocolBlock; index: number; onEdit: (b: ProtocolBlock) => void; onRemove: (id: string) => void; onMove: (from: number, to: number) => void }) {
  return (
    <div className="group mb-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-600">{block.type}</div>
          {'text' in block && <div className="mt-1 font-medium text-slate-900">{(block as any).text}</div>}
          {'title' in block && <div className="mt-1 font-medium text-slate-900">{(block as any).title}</div>}
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => onMove(index, index - 1)}>-</button>
          <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => onMove(index, index + 1)}>+</button>
          <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => onEdit(block)}>編集</button>
          <button type="button" className="rounded-md border px-2 py-1 text-xs text-red-600" onClick={() => onRemove(block.id)}>削除</button>
        </div>
      </div>
    </div>
  );
}

export function ProtocolEditor({ id }: Props) {
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [editingBlock, setEditingBlock] = useState<ProtocolBlock | null>(null);

  useEffect(() => {
    const p = getProtocolById(id);
    if (p) setProtocol(p);
  }, [id]);

  const save = useCallback(() => {
    if (!protocol) return;
    saveProtocol(protocol);
  }, [protocol]);

  const updateField = useCallback((patch: Partial<Protocol>) => {
    setProtocol((prev) => (prev ? { ...prev, ...patch, updatedAt: new Date().toISOString() } : prev));
  }, []);

  const addBlock = useCallback((type: ProtocolBlock['type']) => {
    if (!protocol) return;
    const newBlock: any = { id: uid('b-'), type };
    switch (type) {
      case 'heading':
        newBlock.text = '見出し';
        break;
      case 'text':
        newBlock.text = '本文を編集';
        break;
      case 'materials':
        newBlock.title = '試薬リスト';
        newBlock.items = [];
        break;
      case 'step':
        newBlock.step = '手順を追加';
        break;
      case 'checklist':
        newBlock.items = [];
        break;
      case 'calculation':
        newBlock.title = '計算ブロック';
        newBlock.inputs = [];
        newBlock.constants = [];
        newBlock.formulas = [];
        newBlock.outputs = [];
        break;
      case 'timer':
        newBlock.title = 'タイマー';
        newBlock.durationSeconds = 60;
        break;
      case 'counter':
        newBlock.title = 'カウンター';
        newBlock.initialValue = 0;
        break;
      case 'note':
        newBlock.text = 'メモ';
        break;
      default:
        break;
    }
    setProtocol((prev) => (prev ? { ...prev, blocks: [...prev.blocks, newBlock] } : prev));
  }, [protocol]);

  const removeBlock = useCallback((blockId: string) => {
    setProtocol((prev) => (prev ? { ...prev, blocks: prev.blocks.filter((b) => b.id !== blockId) } : prev));
  }, []);

  const moveBlock = useCallback((from: number, to: number) => {
    setProtocol((prev) => {
      if (!prev) return prev;
      const arr = [...prev.blocks];
      if (to < 0 || to >= arr.length) return prev;
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...prev, blocks: arr };
    });
  }, []);

  const editBlock = useCallback((block: ProtocolBlock) => {
    setEditingBlock(block);
  }, []);

  const applyBlockEdit = useCallback((updated: ProtocolBlock) => {
    setProtocol((prev) => {
      if (!prev) return prev;
      return { ...prev, blocks: prev.blocks.map((b) => (b.id === updated.id ? updated : b)) };
    });
    setEditingBlock(null);
  }, []);

  const calculationPreview = useMemo(() => {
    if (!editingBlock) return null;
    if ((editingBlock as any).type !== 'calculation') return null;
    const cb = editingBlock as CalculationBlock;
    const inputs: Record<string, number> = {};
    cb.inputs.forEach((i) => {
      inputs[i.key] = Number(i.defaultValue ?? 0);
    });
    return evaluateCalculationBlock(cb, inputs);
  }, [editingBlock]);

  if (!protocol) return <div className="px-6 py-8">プロトコルが見つかりません</div>;

  return (
    <div className="space-y-6 px-6 py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <input className="text-2xl font-semibold text-slate-900 outline-none" value={protocol.title} onChange={(e) => updateField({ title: e.target.value })} />
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700" value={protocol.description} onChange={(e) => updateField({ description: e.target.value })} />
            <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700" value={protocol.tags.join(', ')} onChange={(e) => updateField({ tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white" onClick={save}>保存</button>
            <button type="button" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm" onClick={() => { const all = getProtocols(); console.log(all); }}>一覧</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <label className="text-sm text-slate-600">ブロックを追加:</label>
            {['heading','text','materials','step','checklist','calculation','timer','counter','note'].map((t) => (
              <button key={t} type="button" onClick={() => addBlock(t as any)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs">{t}</button>
            ))}
          </div>

          <div>
            {protocol.blocks.map((block, idx) => (
              <BlockRow key={block.id} block={block} index={idx} onEdit={editBlock} onRemove={removeBlock} onMove={moveBlock} />
            ))}
          </div>
        </section>

        <aside>
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-slate-900">編集パネル</h3>
            {!editingBlock && <p className="mt-3 text-sm text-slate-600">ブロックを選択して編集してください。</p>}
            {editingBlock && (
              <div className="mt-3 space-y-3">
                <div className="text-sm text-slate-600">Type: {editingBlock.type}</div>
                {editingBlock.type === 'heading' && (
                  <input className="w-full rounded-2xl border p-2" value={(editingBlock as any).text} onChange={(e) => setEditingBlock({ ...(editingBlock as any), text: e.target.value })} />
                )}
                {editingBlock.type === 'text' && (
                  <textarea className="w-full rounded-2xl border p-2" value={(editingBlock as any).text} onChange={(e) => setEditingBlock({ ...(editingBlock as any), text: e.target.value })} />
                )}
                {editingBlock.type === 'materials' && (
                  <div>
                    <input className="w-full rounded-2xl border p-2" value={(editingBlock as any).title} onChange={(e) => setEditingBlock({ ...(editingBlock as any), title: e.target.value })} />
                    <div className="mt-2 space-y-2">
                      {((editingBlock as any).items || []).map((it: any, i: number) => (
                        <div key={i} className="flex gap-2">
                          <input value={it.name} onChange={(e) => { const items = [...(editingBlock as any).items]; items[i].name = e.target.value; setEditingBlock({ ...(editingBlock as any), items }); }} className="flex-1 rounded-2xl border p-2" />
                          <input value={it.amount} onChange={(e) => { const items = [...(editingBlock as any).items]; items[i].amount = e.target.value; setEditingBlock({ ...(editingBlock as any), items }); }} className="w-28 rounded-2xl border p-2" />
                        </div>
                      ))}
                      <button type="button" className="rounded-full border px-3 py-1 text-xs" onClick={() => setEditingBlock({ ...(editingBlock as any), items: [...((editingBlock as any).items || []), { name: '新規', amount: '' }] })}>項目追加</button>
                    </div>
                  </div>
                )}

                {editingBlock.type === 'step' && (
                  <textarea className="w-full rounded-2xl border p-2" value={(editingBlock as any).step} onChange={(e) => setEditingBlock({ ...(editingBlock as any), step: e.target.value })} />
                )}

                {editingBlock.type === 'checklist' && (
                  <div>
                    {((editingBlock as any).items || []).map((it: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="checkbox" checked={!!it.checked} onChange={(e) => { const items = [...(editingBlock as any).items]; items[i].checked = e.target.checked; setEditingBlock({ ...(editingBlock as any), items }); }} />
                        <input value={it.text} onChange={(e) => { const items = [...(editingBlock as any).items]; items[i].text = e.target.value; setEditingBlock({ ...(editingBlock as any), items }); }} className="flex-1 rounded-2xl border p-2" />
                      </div>
                    ))}
                    <button type="button" className="rounded-full border px-3 py-1 text-xs" onClick={() => setEditingBlock({ ...(editingBlock as any), items: [...((editingBlock as any).items || []), { id: uid('i-'), text: '新規', checked: false }] })}>項目追加</button>
                  </div>
                )}

                {editingBlock.type === 'calculation' && (
                  <div>
                    <input className="w-full rounded-2xl border p-2" value={(editingBlock as any).title} onChange={(e) => setEditingBlock({ ...(editingBlock as any), title: e.target.value })} />
                    <div className="mt-2 text-sm text-slate-600">Inputs</div>
                    {((editingBlock as any).inputs || []).map((inp: any, i: number) => (
                      <div key={inp.id} className="flex gap-2 mt-2">
                        <input value={inp.label} onChange={(e) => { const inputs = [...(editingBlock as any).inputs]; inputs[i].label = e.target.value; setEditingBlock({ ...(editingBlock as any), inputs }); }} className="flex-1 rounded-2xl border p-2" />
                        <input type="number" value={inp.defaultValue ?? 0} onChange={(e) => { const inputs = [...(editingBlock as any).inputs]; inputs[i].defaultValue = Number(e.target.value); setEditingBlock({ ...(editingBlock as any), inputs }); }} className="w-28 rounded-2xl border p-2" />
                      </div>
                    ))}
                    <button type="button" className="mt-2 rounded-full border px-3 py-1 text-xs" onClick={() => setEditingBlock({ ...(editingBlock as any), inputs: [...((editingBlock as any).inputs || []), { id: uid('inp-'), key: `in_${Date.now()}`, label: 'input', defaultValue: 0 }] })}>Input 追加</button>

                    <div className="mt-3 text-sm text-slate-600">Formulas</div>
                    {((editingBlock as any).formulas || []).map((f: any, i: number) => (
                      <div key={f.id} className="mt-2">
                        <input value={f.label} onChange={(e) => { const fs = [...(editingBlock as any).formulas]; fs[i].label = e.target.value; setEditingBlock({ ...(editingBlock as any), formulas: fs }); }} className="w-full rounded-2xl border p-2" />
                        <input value={f.expression} onChange={(e) => { const fs = [...(editingBlock as any).formulas]; fs[i].expression = e.target.value; setEditingBlock({ ...(editingBlock as any), formulas: fs }); }} className="w-full rounded-2xl border p-2 mt-1" />
                      </div>
                    ))}
                    <button type="button" className="mt-2 rounded-full border px-3 py-1 text-xs" onClick={() => setEditingBlock({ ...(editingBlock as any), formulas: [...((editingBlock as any).formulas || []), { id: uid('f-'), key: `out_${Date.now()}`, label: 'out', expression: '0' }] })}>Formula 追加</button>

                    <div className="mt-3 text-sm text-slate-700">Preview</div>
                    <pre className="mt-2 rounded-2xl bg-slate-50 p-2 text-xs">{JSON.stringify(calculationPreview, null, 2)}</pre>
                  </div>
                )}

                {editingBlock.type === 'timer' && (
                  <div>
                    <input type="number" value={(editingBlock as any).durationSeconds} onChange={(e) => setEditingBlock({ ...(editingBlock as any), durationSeconds: Number(e.target.value) })} className="w-full rounded-2xl border p-2" />
                  </div>
                )}

                {editingBlock.type === 'counter' && (
                  <div>
                    <input type="number" value={(editingBlock as any).initialValue} onChange={(e) => setEditingBlock({ ...(editingBlock as any), initialValue: Number(e.target.value) })} className="w-full rounded-2xl border p-2" />
                  </div>
                )}

                {editingBlock.type === 'note' && (
                  <textarea className="w-full rounded-2xl border p-2" value={(editingBlock as any).text} onChange={(e) => setEditingBlock({ ...(editingBlock as any), text: e.target.value })} />
                )}

                <div className="flex gap-2">
                  <button type="button" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white" onClick={() => applyBlockEdit(editingBlock!)}>適用</button>
                  <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => setEditingBlock(null)}>キャンセル</button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
