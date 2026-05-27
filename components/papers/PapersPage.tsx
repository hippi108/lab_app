'use client';
import { useMemo, useState } from 'react';
import { getPapers, savePapers } from '@/lib/repositories/paperRepository';
import type { Paper } from '@/types/paper';

const initialValues: Omit<Paper, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  authors: [],
  journal: '',
  year: undefined,
  doi: '',
  url: '',
  pdfUrl: '',
  abstract: '',
  tags: [],
};

export function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>(() => getPapers());
  const [formValues, setFormValues] = useState(initialValues);

  const hasPdfUrl = useMemo(() => Boolean(formValues.pdfUrl), [formValues.pdfUrl]);

  const addPaper = () => {
    const newPaper: Paper = {
      id: `paper-${Date.now()}`,
      title: formValues.title || 'Untitled',
      authors: formValues.authors.filter(Boolean),
      year: formValues.year,
      journal: formValues.journal,
      doi: formValues.doi,
      url: formValues.url,
      pdfUrl: formValues.pdfUrl,
      abstract: formValues.abstract,
      tags: formValues.tags.filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const next = [newPaper, ...papers];
    setPapers(next);
    savePapers(next);
    setFormValues(initialValues);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-slate-900">論文管理</h2>
        <p className="mt-2 text-slate-600">DOI / URL / PDF URL を入力して論文を管理します。</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900">論文を追加</h3>
          <div className="grid gap-4">
            <label className="block text-sm text-slate-700">
              <span className="mb-1 block font-medium text-slate-800">タイトル</span>
              <input
                type="text"
                value={formValues.title}
                onChange={(event) => setFormValues((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
            </label>
            <label className="block text-sm text-slate-700">
              <span className="mb-1 block font-medium text-slate-800">著者</span>
              <input
                type="text"
                value={formValues.authors.join(', ')}
                onChange={(event) => setFormValues((prev) => ({ ...prev, authors: event.target.value.split(',').map((value) => value.trim()) }))}
                placeholder="例: Tanaka, Suzuki"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-700">
                <span className="mb-1 block font-medium text-slate-800">年</span>
                <input
                  type="number"
                  value={formValues.year ?? ''}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, year: Number(event.target.value) || undefined }))}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </label>
              <label className="block text-sm text-slate-700">
                <span className="mb-1 block font-medium text-slate-800">ジャーナル</span>
                <input
                  type="text"
                  value={formValues.journal}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, journal: event.target.value }))}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </label>
            </div>
            <label className="block text-sm text-slate-700">
              <span className="mb-1 block font-medium text-slate-800">DOI</span>
              <input
                type="text"
                value={formValues.doi}
                onChange={(event) => setFormValues((prev) => ({ ...prev, doi: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
            </label>
            <label className="block text-sm text-slate-700">
              <span className="mb-1 block font-medium text-slate-800">URL</span>
              <input
                type="text"
                value={formValues.url}
                onChange={(event) => setFormValues((prev) => ({ ...prev, url: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
            </label>
            <label className="block text-sm text-slate-700">
              <span className="mb-1 block font-medium text-slate-800">PDF URL</span>
              <input
                type="text"
                value={formValues.pdfUrl}
                onChange={(event) => setFormValues((prev) => ({ ...prev, pdfUrl: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
            </label>
            <label className="block text-sm text-slate-700">
              <span className="mb-1 block font-medium text-slate-800">タグ</span>
              <input
                type="text"
                value={formValues.tags.join(', ')}
                onChange={(event) => setFormValues((prev) => ({ ...prev, tags: event.target.value.split(',').map((value) => value.trim()) }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
            </label>
            <label className="block text-sm text-slate-700">
              <span className="mb-1 block font-medium text-slate-800">概要</span>
              <textarea
                rows={4}
                value={formValues.abstract}
                onChange={(event) => setFormValues((prev) => ({ ...prev, abstract: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
            </label>
            <button
              type="button"
              onClick={addPaper}
              className="mt-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              追加
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">PDF プレビュー</h3>
            {hasPdfUrl ? (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
                <a href={formValues.pdfUrl} target="_blank" rel="noreferrer" className="text-sm text-slate-900 underline">
                  PDF を別タブで開く
                </a>
                <div className="mt-4 h-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                  <iframe src={formValues.pdfUrl} className="h-full w-full" title="PDF Preview" />
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">PDF URL を入力するとプレビューまたは外部表示できます。</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">登録済み論文</h3>
            <div className="mt-4 space-y-4">
              {papers.length === 0 ? (
                <p className="text-sm text-slate-600">まだ論文がありません。</p>
              ) : (
                papers.map((paper) => (
                  <div key={paper.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="font-semibold text-slate-900">{paper.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{paper.authors.join(', ')} {paper.year ? `(${paper.year})` : ''}</p>
                    {paper.pdfUrl ? (
                      <a href={paper.pdfUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-slate-900 underline">
                        PDF を開く
                      </a>
                    ) : paper.url ? (
                      <a href={paper.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-slate-900 underline">
                        URL を開く
                      </a>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
