# Lab App MVP

このリポジトリは、研究室・教育向けプロトコル共有と計算支援を目指した Next.js MVP です。

## 実装内容

- Next.js App Router + TypeScript + Tailwind CSS
- `localStorage` ベースのプロトコル / 論文保存
- プロトコル一覧と詳細画面
- サンプル PCR プロトコルを表示し、変数変更で計算結果を即時更新
- PCR / 希釈 / モル濃度 / カスタム計算機
- PDF 出力（`jspdf`）
- タイマー、カウンター、実験メモ画面
- 論文管理画面：URL / DOI / PDF URL 登録と外部表示
- ビルド済み、`npm run lint` クリア

## 使い方

```bash
npm install
npm run dev
```

## 残課題

- プロトコル編集画面の本格実装
- IndexedDB / Dexie を使った永続保存
- プロトコル PDF レイアウトの強化
- `react-pdf` を使った PDF viewer の本格対応
- 認証 / Supabase 連携
- ダークモード対応
- スマホ最適化の追加

## プロトコル編集（追加実装）

- ブロックエディタを実装しました（`components/protocol/ProtocolEditor.tsx`）。
- タイトル・概要・タグの編集、ブロックの追加・削除・並び替えが可能です。
- ブロック種別: 見出し、本文、試薬リスト、手順、チェックリスト、計算ブロック、タイマー、カウンター、メモ をサポートします。
- 計算ブロックは式を編集するとプレビューで即時評価されます（`lib/calculations/evaluateCalculationBlock.ts`）。
- 編集内容は `localStorage` に保存され、ページを再読み込みしても残ります（`lib/repositories/protocolRepository.ts` の `saveProtocol` を利用）。
- `/protocols` はクライアントサイドで保存済みプロトコルを読み込み、`/protocols/[id]` で詳細編集できるようにしました。
- `/run` には実験メモ、チェックリスト、材料リスト、計算結果、タイマー、カウンターをまとめた実験支援ビューを追加しました。

## Git リポジトリの初期化

ローカルで git リポジトリを初期化し、リモートを追加する手順:

```bash
git init
git add .
git commit -m "Initial lab_app MVP with protocol editor"
git branch -M main
git remote add origin git@github.com:hippi108/lab_app.git
```

リモートへの push は認証が必要です。必要であればこれも実行します。

## ルートページ

- `/`
- `/protocols`
- `/protocols/[id]`
- `/calculators`
- `/run`
- `/papers`
