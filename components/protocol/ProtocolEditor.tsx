'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { exportProtocolPdf } from '@/lib/pdf/exportProtocolPdf';
import { evaluateCalculationBlock } from '@/lib/calculations/evaluateCalculationBlock';
import {
  getProtocolById,
  getProtocols,
  saveProtocol,
} from '@/lib/repositories/protocolRepository';
import type {
  Protocol,
  ProtocolBlock,
} from '@/types/protocol';

const blockTypeLabel: Record<string, string> = {
  heading: '見出し',
  text: '本文',
  materials: '材料',
  step: '手順',
  checklist: 'チェックリスト',
  calculation: '計算',
  timer: 'タイマー',
  counter: 'カウンター',
  note: 'メモ',
  reference: '参考文献',
};

const blockTypeIcon: Record<string, string> = {
  heading: '📌',
  text: '📝',
  materials: '🧪',
  step: '➡️',
  checklist: '☑️',
  calculation: '∑',
  timer: '⏱',
  counter: '🔢',
  note: '🗒',
  reference: '📚',
};

const createEmptyBlock = (type: ProtocolBlock['type']): ProtocolBlock => {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;
  switch (type) {
    case 'heading':
      return { id, type, text: '新しいセクション' };
    case 'text':
      return { id, type, text: '自由記述テキスト' };
    case 'materials':
      return { id, type, title: '材料リスト', items: [{ name: '試薬A', amount: '100 µL' }] };
    case 'step':
      return { id, type, step: 'ここに手順を入力します。' };
    case 'checklist':
      return { id, type, items: [{ id: `${id}-1`, text: '準備完了', checked: false }] };
    case 'calculation':
      return {
        id,
        type,
        title: '反応計算',
        description: '試料数に合わせて反応液量を計算します。',
        inputs: [
          { id: `${id}-sample_count`, key: 'sample_count', label: 'サンプル数', unit: '本', defaultValue: 8, min: 1 },
        ],
        constants: [],
        formulas: [
          { id: `${id}-1`, key: 'reaction_volume', label: '反応液量', expression: 'sample_count * 20', unit: 'µL' },
          { id: `${id}-2`, key: 'water_volume', label: '水量', expression: 'reaction_volume - 10', unit: 'µL' },
        ],
        outputs: [
          { id: `${id}-out-1`, key: 'reaction_volume', label: '反応液量', unit: 'µL' },
          { id: `${id}-out-2`, key: 'water_volume', label: '水量', unit: 'µL' },
        ],
      };
    case 'timer':
      return { id, type, title: 'インキュベーション', durationSeconds: 300 };
    case 'counter':
      return { id, type, title: 'サンプル計測', initialValue: 0 };
    case 'note':
      return { id, type, text: '実験中の備考を入力します。' };
    case 'reference':
      return { id, type, title: '参考資料', paperId: '' };
    default:
      return { id, type: 'text', text: '' };
  }
};

const formatDisplayValue = (value: number | string | undefined) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(value);
};

export function ProtocolEditor({ id }: { id: string }) {
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [allProtocols, setAllProtocols] = useState<Protocol[]>([]);
  const [editingBlock, setEditingBlock] = useState<ProtocolBlock | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [savedSnapshot, setSavedSnapshot] = useState('');

  useEffect(() => {
    const protocols = getProtocols();
    setAllProtocols(protocols);
    const target = getProtocolById(id) ?? protocols[0] ?? null;
    setProtocol(target);
    setEditingBlock(target?.blocks[0] ?? null);
    if (target) {
      setSavedSnapshot(JSON.stringify(target));
    }
  }, [id]);

  const isDirty = useMemo(() => {
    if (!protocol) return false;
    return JSON.stringify(protocol) !== savedSnapshot;
  }, [protocol, savedSnapshot]);

  const selectBlock = (block: ProtocolBlock) => {
    setEditingBlock(block);
  };

  const updateProtocol = (patch: Partial<Protocol>) => {
    setProtocol((current) => {
      if (!current) return current;
      return {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const updateBlockById = (blockId: string, patch: Partial<ProtocolBlock>) => {
    setProtocol((current) => {
      if (!current) return current;
      return {
        ...current,
        blocks: current.blocks.map((block) =>
          block.id === blockId ? ({ ...block, ...patch } as ProtocolBlock) : block,
        ),
        updatedAt: new Date().toISOString(),
      };
    });
    setEditingBlock((current) => (current && current.id === blockId ? ({ ...current, ...patch } as ProtocolBlock) : current));
  };

  const addBlock = (type: ProtocolBlock['type']) => {
    if (!protocol) return;
    const block = createEmptyBlock(type);
    const updated = {
      ...protocol,
      blocks: [...protocol.blocks, block],
      updatedAt: new Date().toISOString(),
    };
    setProtocol(updated);
    setEditingBlock(block);
  };

  const deleteBlock = (blockId: string) => {
    if (!protocol) return;
    const updatedBlocks = protocol.blocks.filter((block) => block.id !== blockId);
    setProtocol({ ...protocol, blocks: updatedBlocks, updatedAt: new Date().toISOString() });
    if (editingBlock?.id === blockId) {
      setEditingBlock(updatedBlocks[0] ?? null);
    }
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    if (!protocol) return;
    const index = protocol.blocks.findIndex((block) => block.id === blockId);
    if (index < 0) return;
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= protocol.blocks.length) return;
    const blocks = [...protocol.blocks];
    const [block] = blocks.splice(index, 1);
    blocks.splice(nextIndex, 0, block);
    setProtocol({ ...protocol, blocks, updatedAt: new Date().toISOString() });
  };

  const saveCurrentProtocol = () => {
    if (!protocol) return;
    saveProtocol(protocol);
    setSaveMessage('保存しました');
    setSavedSnapshot(JSON.stringify(protocol));
    setAllProtocols(getProtocols());
    window.setTimeout(() => setSaveMessage(''), 2500);
  };

  const selectedCalculationResult = useMemo(() => {
    if (!editingBlock || editingBlock.type !== 'calculation') return null;
    const inputValues = editingBlock.inputs.reduce<Record<string, number>>((acc, input) => {
      acc[input.key] = Number(input.defaultValue ?? 0);
      return acc;
    }, {});
    return evaluateCalculationBlock(editingBlock, inputValues);
  }, [editingBlock]);

  if (!protocol) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-soft">
        プロトコルが見つかりません。URL を確認するか、一覧からプロトコルを選択してください。
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_360px] px-4 py-6 sm:px-6 lg:px-8">
      <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="space-y-2">
          <p className="text-sm text-slate-500">プロトコル一覧</p>
          <h2 className="text-xl font-semibold text-slate-900">プロトコル</h2>
        </div>
        <div className="space-y-3">
          {allProtocols.map((item) => (
            <Link
              key={item.id}
              href={`/protocols/${item.id}`}
              className={`block rounded-3xl border px-4 py-3 text-sm transition ${item.id === protocol.id ? 'border-slate-900 bg-slate-100 text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-900 hover:bg-slate-50'}`}
            >
              <div className="font-semibold">{item.title}</div>
              <div className="text-xs text-slate-500">{item.tags.join(' / ') || 'タグなし'}</div>
            </Link>
          ))}
        </div>
        <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">保存状態</p>
          <p className="mt-2 text-slate-600">{isDirty ? '未保存の変更があります。' : '保存されています。'}</p>
        </div>
      </aside>

      <main className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm text-slate-500">編集中</p>
              <h1 className="text-3xl font-semibold text-slate-900">{protocol.title}</h1>
              <p className="mt-2 text-slate-600">{protocol.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={saveCurrentProtocol}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                保存する
              </button>
              <span className={`rounded-full px-3 py-2 text-sm ${isDirty ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {isDirty ? '未保存' : '保存済み'}
              </span>
            </div>
          </div>
          {saveMessage ? (
            <div className="mt-4 rounded-3xl bg-emerald-100 px-4 py-3 text-sm text-emerald-900">{saveMessage}</div>
          ) : null}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span className="font-medium text-slate-900">タイトル</span>
              <input
                type="text"
                value={protocol.title}
                onChange={(event) => updateProtocol({ title: event.target.value })}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span className="font-medium text-slate-900">タグ</span>
              <input
                type="text"
                value={protocol.tags.join(', ')}
                onChange={(event) => updateProtocol({ tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                placeholder="例: PCR, 反応液"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">ブロック</p>
              <h2 className="text-xl font-semibold text-slate-900">プロトコル構成</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['heading', 'text', 'materials', 'step', 'checklist', 'calculation', 'note'] as ProtocolBlock['type'][]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => addBlock(type)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:bg-slate-100"
                >
                  {blockTypeIcon[type]} {blockTypeLabel[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {protocol.blocks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                右上のボタンからブロックを追加してください。
              </div>
            ) : (
              protocol.blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`rounded-3xl border px-4 py-4 transition ${editingBlock?.id === block.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-900'}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <span>{blockTypeIcon[block.type]}</span>
                        <span>{blockTypeLabel[block.type]}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{index + 1}</span>
                      </div>
                      <div className="text-sm text-slate-600">
                        {block.type === 'heading' && (block as { text: string }).text}
                        {block.type === 'text' && (block as { text: string }).text}
                        {block.type === 'materials' && `材料 ${((block as { items: { name: string }[] }).items.length || 0)} 件`}
                        {block.type === 'step' && (block as { step: string }).step}
                        {block.type === 'checklist' && `${(block as { items: { text: string }[] }).items.length} 件`}
                        {block.type === 'calculation' && (block as { title: string }).title}
                        {block.type === 'note' && (block as { text: string }).text}
                        {block.type === 'reference' && (block as { title: string }).title}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => selectBlock(block)}
                        className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 font-medium text-slate-700 hover:border-slate-900"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(block.id, 'up')}
                        className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 font-medium text-slate-700 hover:border-slate-900"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(block.id, 'down')}
                        className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 font-medium text-slate-700 hover:border-slate-900"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBlock(block.id)}
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 font-medium text-rose-700 hover:border-rose-300"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <aside className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">選択中のブロック</p>
              <h2 className="text-xl font-semibold text-slate-900">{editingBlock ? blockTypeLabel[editingBlock.type] : '未選択'}</h2>
            </div>
            {editingBlock && (
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">{blockTypeIcon[editingBlock.type]}</span>
            )}
          </div>

          {editingBlock ? (
            <div className="mt-6 space-y-4">
              {editingBlock.type === 'heading' && (
                <label className="space-y-2 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">セクション名</span>
                  <input
                    type="text"
                    value={editingBlock.text}
                    onChange={(event) => updateBlockById(editingBlock.id, { text: event.target.value })}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>
              )}
              {editingBlock.type === 'text' && (
                <label className="space-y-2 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">本文</span>
                  <textarea
                    value={editingBlock.text}
                    onChange={(event) => updateBlockById(editingBlock.id, { text: event.target.value })}
                    className="min-h-[150px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>
              )}
              {editingBlock.type === 'materials' && (
                <div className="space-y-4">
                  <label className="space-y-2 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">タイトル</span>
                    <input
                      type="text"
                      value={editingBlock.title}
                      onChange={(event) => updateBlockById(editingBlock.id, { title: event.target.value })}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                    />
                  </label>
                  <div className="space-y-3">
                    {editingBlock.items.map((item, index) => (
                      <div key={`${item.name}-${index}`} className="grid gap-3 sm:grid-cols-[1fr_120px]">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(event) => {
                            const next = editingBlock.items.map((nextItem, itemIndex) =>
                              itemIndex === index ? { ...nextItem, name: event.target.value } : nextItem,
                            );
                            updateBlockById(editingBlock.id, { items: next });
                          }}
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                        />
                        <input
                          type="text"
                          value={item.amount}
                          onChange={(event) => {
                            const next = editingBlock.items.map((nextItem, itemIndex) =>
                              itemIndex === index ? { ...nextItem, amount: event.target.value } : nextItem,
                            );
                            updateBlockById(editingBlock.id, { items: next });
                          }}
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {editingBlock.type === 'step' && (
                <label className="space-y-2 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">手順</span>
                  <textarea
                    value={editingBlock.step}
                    onChange={(event) => updateBlockById(editingBlock.id, { step: event.target.value })}
                    className="min-h-[150px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>
              )}
              {editingBlock.type === 'checklist' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {editingBlock.items.map((item, index) => (
                      <input
                        key={item.id}
                        type="text"
                        value={item.text}
                        onChange={(event) => {
                          const next = editingBlock.items.map((nextItem, itemIndex) =>
                            itemIndex === index ? { ...nextItem, text: event.target.value } : nextItem,
                          );
                          updateBlockById(editingBlock.id, { items: next });
                        }}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                      />
                    ))}
                  </div>
                </div>
              )}
              {editingBlock.type === 'calculation' && (
                <div className="space-y-4">
                  <label className="space-y-2 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">タイトル</span>
                    <input
                      type="text"
                      value={editingBlock.title}
                      onChange={(event) => updateBlockById(editingBlock.id, { title: event.target.value })}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">説明</span>
                    <textarea
                      value={editingBlock.description ?? ''}
                      onChange={(event) => updateBlockById(editingBlock.id, { description: event.target.value })}
                      className="min-h-[120px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                    />
                  </label>
                </div>
              )}
              {editingBlock.type === 'note' && (
                <label className="space-y-2 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">メモ</span>
                  <textarea
                    value={editingBlock.text}
                    onChange={(event) => updateBlockById(editingBlock.id, { text: event.target.value })}
                    className="min-h-[150px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>
              )}

              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-slate-900">最終更新</p>
                <p className="mt-2">{new Date(protocol.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              編集するブロックを左のリストから選択してください。
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">プレビュー</p>
              <h2 className="text-xl font-semibold text-slate-900">計算ブロック結果</h2>
            </div>
            <button
              type="button"
              onClick={() => exportProtocolPdf(protocol)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              PDF 出力
            </button>
          </div>

          {editingBlock?.type === 'calculation' ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-medium text-slate-900">計算説明</p>
                <p className="mt-2">{editingBlock.description ?? '入力値を変更すると即時に計算結果が更新されます。'}</p>
              </div>

              <div className="space-y-3">
                {editingBlock.inputs.map((input) => (
                  <label key={input.id} className="space-y-2 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">{input.label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={input.defaultValue ?? 0}
                        onChange={(event) => {
                          const updatedInputs = editingBlock.inputs.map((nextInput) =>
                            nextInput.id === input.id ? { ...nextInput, defaultValue: Number(event.target.value) } : nextInput,
                          );
                          updateBlockById(editingBlock.id, { inputs: updatedInputs });
                        }}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                      />
                      <span className="text-slate-500">{input.unit ?? ''}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <div className="mb-3 text-sm font-semibold text-slate-900">結果</div>
                {selectedCalculationResult?.error ? (
                  <p className="text-rose-600">{selectedCalculationResult.error}</p>
                ) : selectedCalculationResult ? (
                  <div className="space-y-3">
                    {Object.entries(selectedCalculationResult.outputs ?? {}).map(([key, value]) => {
                      const warning = key === 'water_volume' && typeof value === 'number' && value < 0;
                      return (
                        <div key={key} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-4 text-sm text-slate-900">
                            <span>{key}</span>
                            <span>{formatDisplayValue(value)}</span>
                          </div>
                          {warning && <p className="mt-2 text-sm text-rose-600">警告: 水量が負の値になっています。入力を確認してください。</p>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-600">計算結果を表示します。</p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              計算ブロックを選択すると入力と結果がここに表示されます。
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
