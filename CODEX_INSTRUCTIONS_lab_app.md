# Codex 指示書：Lab App MVP 開発

## 0. 前提

作業ディレクトリ：

```bash
cd /home/nakamura/dev_app/lab_app
```

このプロジェクトは、研究室・学校教育向けの **プロトコル共有 / 実験計算 / 実験実行支援 Web アプリ** である。

メインターゲットは PC / Web 版。  
スマホ版は将来的に PWA または React Native / Expo で展開するが、初期実装では Web アプリをレスポンシブ対応し、スマホでは「閲覧・計算・タイマー・カウンター・メモ」に特化させる。

開発マシンは十分な性能があるため、Next.js / TypeScript / Tailwind / shadcn/ui で実装する。

---

## 1. アプリのコンセプト

このアプリは、単なる実験用計算機ではなく、以下を統合する。

1. 研究室・授業・コミュニティ単位でのプロトコル管理
2. サンプル数や濃度に応じて自動更新される動的プロトコル
3. PCR計算・希釈計算・モル濃度計算・カスタム計算式
4. 実験中に使うタイマー・カウンター・メモ
5. プロトコルの PDF 出力
6. 将来的な Notion / Goodnotes / Markdown 連携
7. 論文リンク管理と PDF viewer

中心コンセプト：

> プロトコルを「読むだけの文書」から、条件に応じて計算・再生成できる「動的な実験手順書」にする。

---

## 2. 初期開発方針

まずはローカルで動く MVP を作る。  
認証、Supabase、クラウド同期は後回し。  
データは最初は localStorage または IndexedDB に保存する。

ただし、将来 Supabase に移行しやすいように、型定義とデータアクセス層を分離する。

優先順位：

1. Next.js プロジェクトを作成
2. モダンな UI の土台を作る
3. プロトコル一覧画面
4. プロトコル編集画面
5. 計算ブロック
6. PDF 出力
7. タイマー / カウンター
8. 論文管理画面

---

## 3. 技術スタック

推奨構成：

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- zustand
- react-hook-form
- zod
- mathjs
- date-fns
- jspdf または @react-pdf/renderer
- pdf.js / react-pdf
- IndexedDB 用に dexie
- ESLint / Prettier

初期状態で Supabase は導入しなくてよい。  
ただし、`lib/repositories` のような層を作り、後から DB を差し替えやすくする。

---

## 4. ディレクトリ構成

以下のような構成にする。

```text
/home/nakamura/dev_app/lab_app
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── protocols/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── calculators/
│   │   └── page.tsx
│   ├── run/
│   │   └── page.tsx
│   ├── papers/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── components/
│   ├── layout/
│   ├── protocol/
│   ├── calculators/
│   ├── timers/
│   ├── counters/
│   ├── papers/
│   └── ui/
├── lib/
│   ├── calculations/
│   ├── paper/
│   ├── pdf/
│   ├── storage/
│   ├── repositories/
│   └── utils/
├── types/
│   ├── protocol.ts
│   ├── calculation.ts
│   ├── paper.ts
│   └── workspace.ts
└── data/
    └── sample-protocols.ts
```

---

## 5. 画面設計

### 5.1 ホーム画面

目的：アプリ全体のダッシュボード。

表示するもの：

- 最近編集したプロトコル
- よく使う計算機
- 今日の実験 Run
- 最近登録した論文
- 新規作成ボタン

UI は、Notion / Linear / Vercel Dashboard のようなシンプルで現代的なカード型にする。

---

### 5.2 プロトコル一覧画面 `/protocols`

機能：

- プロトコル一覧表示
- 検索
- タグフィルタ
- 新規作成
- 複製
- 削除
- PDF 出力

プロトコルカードには以下を表示：

- タイトル
- 概要
- タグ
- 更新日
- 作成者
- ブロック数
- Run 開始ボタン

---

### 5.3 プロトコル編集画面 `/protocols/[id]`

PC/Web の中心画面。

レイアウト：

```text
左サイドバー：
- プロトコル一覧
- 計算機
- 論文
- 設定

中央：
- プロトコル本文エディタ

右サイドバー：
- プロトコル変数
- 計算結果
- PDF 出力
- 実験 Run 開始
```

編集できるブロック：

- 見出し
- 説明文
- 注意事項
- 試薬リスト
- 手順
- チェックリスト
- 計算ブロック
- タイマーブロック
- カウンターブロック
- メモ欄
- 論文参照ブロック

---

### 5.4 実験 Run 画面 `/run`

スマホ・タブレット・実験中利用を意識した画面。

機能：

- プロトコルを読みやすく表示
- サンプル数などの変数入力
- 計算結果の即時更新
- チェックリスト
- タイマー
- カウンター
- 実験メモ
- 写真添付は将来対応
- Run 結果保存は将来対応

スマホでは編集機能を最小限にし、「見る・計算する・測る・記録する」に集中する。

---

### 5.5 計算機画面 `/calculators`

初期実装する計算機：

1. PCR 計算
2. 希釈計算
3. モル濃度計算
4. カスタム計算機

各計算機は単体でも使えるが、将来的にはプロトコルに埋め込めるようにする。

---

### 5.6 論文管理画面 `/papers`

目的：プロトコルと関連論文を紐づける。

初期機能：

- DOI / URL / arXiv URL / PubMed URL を入力
- タイトル、著者、年、ジャーナルを手動または自動取得
- 論文テーブルに追加
- PDF URL がある場合、PDF viewer で表示
- プロトコルに論文参照として紐づけ

注意：

- `wget` でサーバーに永続保存する設計は初期実装では避ける。
- 代わりに、PDF URL を保存し、ブラウザ上の viewer で表示する。
- CORS で直接表示できない PDF もあるため、その場合は「外部で開く」ボタンを表示する。
- 将来的に必要なら、短期キャッシュ・ユーザー手元への保存・Supabase Storage 連携を検討する。
- 著作権の観点から、有料論文 PDF の無断保存・再配布は避ける。

---

## 6. データ型

### 6.1 Protocol

```ts
export type Protocol = {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  tags: string[];
  version: number;
  status: "draft" | "published" | "archived";
  variables: ProtocolVariable[];
  blocks: ProtocolBlock[];
  references: PaperReference[];
  createdAt: string;
  updatedAt: string;
};
```

### 6.2 ProtocolVariable

```ts
export type ProtocolVariable = {
  id: string;
  key: string;
  label: string;
  type: "number" | "text" | "select" | "boolean";
  unit?: string;
  defaultValue?: string | number | boolean;
  description?: string;
};
```

### 6.3 ProtocolBlock

```ts
export type ProtocolBlock =
  | HeadingBlock
  | TextBlock
  | MaterialsBlock
  | StepBlock
  | ChecklistBlock
  | CalculationBlock
  | TimerBlock
  | CounterBlock
  | NoteBlock
  | ReferenceBlock;
```

### 6.4 CalculationBlock

```ts
export type CalculationBlock = {
  id: string;
  type: "calculation";
  title: string;
  description?: string;
  inputs: CalculationInput[];
  constants: CalculationConstant[];
  formulas: CalculationFormula[];
  outputs: CalculationOutput[];
};
```

### 6.5 CalculationInput

```ts
export type CalculationInput = {
  id: string;
  key: string;
  label: string;
  unit?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  required?: boolean;
};
```

### 6.6 CalculationFormula

```ts
export type CalculationFormula = {
  id: string;
  key: string;
  label: string;
  expression: string;
  unit?: string;
};
```

例：

```ts
{
  key: "total_volume",
  label: "総反応液量",
  expression: "sample_count * reaction_volume * excess_rate",
  unit: "µL"
}
```

### 6.7 Paper

```ts
export type Paper = {
  id: string;
  title: string;
  authors: string[];
  year?: number;
  journal?: string;
  doi?: string;
  url?: string;
  pdfUrl?: string;
  abstract?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};
```

---

## 7. 計算ロジック

`lib/calculations` に純粋関数として実装する。

要件：

- UI と計算ロジックを分離する
- 単位変換は最初は簡易対応
- 数式評価には mathjs を使う
- 入力値が不正なときはクラッシュせず、エラーを返す
- 計算結果は丸め桁数を指定できるようにする

### 7.1 PCR 計算

入力：

- sample_count
- reaction_volume
- excess_rate
- buffer_ratio
- dntp_volume_per_reaction
- primer_f_volume_per_reaction
- primer_r_volume_per_reaction
- polymerase_volume_per_reaction
- template_volume_per_reaction

出力：

- total_reaction_volume
- buffer_volume
- dntp_volume
- primer_f_volume
- primer_r_volume
- polymerase_volume
- template_volume
- water_volume

計算例：

```ts
total = sample_count * reaction_volume * excess_rate
component = per_reaction_volume * sample_count * excess_rate
water = total - sum(components)
```

### 7.2 希釈計算

基本式：

```text
C1 * V1 = C2 * V2
```

入力モード：

- C1, C2, V2 から V1 を求める
- C1, V1, V2 から C2 を求める
- C1, V1, C2 から V2 を求める

### 7.3 モル濃度計算

基本：

```text
moles = mass / molecular_weight
molarity = moles / volume_L
```

必要に応じて逆算も実装する。

### 7.4 カスタム計算機

初期は高度な GUI 式ビルダーではなく、以下でよい。

- 入力項目を追加
- 定数を追加
- 数式をテキストで入力
- 出力項目を表示
- プレビュー実行
- 保存

例：

```text
sample_count * reaction_volume * excess_rate
```

---

## 8. PDF 出力

初期実装では、プロトコルを PDF 化できるようにする。

PDF に含めるもの：

- タイトル
- 概要
- タグ
- 変数値
- 試薬リスト
- 手順
- 計算結果
- 注意事項
- 参考論文
- 作成日
- バージョン

Goodnotes で読みやすいように、A4 縦、余白広め、チェックボックス付きの形式を用意する。

PDF 出力は `lib/pdf` に分離する。

---

## 9. 論文管理機能の実装方針

初期実装は以下。

1. DOI / URL / PDF URL を入力
2. 論文情報フォームに反映
3. テーブル表示
4. PDF URL がある場合は viewer で表示
5. プロトコルに関連論文として紐づけ

最初から完全自動取得にこだわらなくてよい。  
まずは手入力 + PDF URL viewer を作る。

後から追加する自動取得候補：

- DOI から Crossref
- arXiv ID から arXiv API
- PubMed ID から NCBI Entrez
- OpenAlex からメタデータ取得

重要：

- PDF をサーバーに保存しない設計を基本とする。
- URL を保存し、ブラウザで表示する。
- CORS やアクセス権限で表示できない場合は外部リンクとして開く。
- 著作権上、ユーザーが権利を持たない PDF の共有・再配布をしない。

---

## 10. UI デザイン方針

全体：

- 現代的
- 余白を広め
- カード型
- 角丸
- 淡い背景
- サイドバー + メイン + 右パネル
- ダークモードは将来対応

参考方向：

- Notion
- esa
- Linear
- Vercel Dashboard
- shadcn/ui

ただし、完全コピーはしない。  
独自の研究室・教育向け UI にする。

色：

- 白 / slate / zinc 系を基調
- アクセントに blue または emerald
- 実験中モードでは視認性重視

---

## 11. 初期サンプルデータ

最低限、以下のサンプルプロトコルを入れる。

1. PCR Master Mix Preparation
2. Dilution Calculation
3. Molar Solution Preparation

PCR のサンプルプロトコルには以下を含める。

- 説明文
- 試薬リスト
- 手順
- PCR計算ブロック
- 5分タイマー
- チェックリスト
- PDF出力確認用の項目

---

## 12. 実装手順

### Step 1: プロジェクト初期化

既にプロジェクトが存在する場合は壊さない。  
存在しない場合は Next.js を作る。

```bash
cd /home/nakamura/dev_app/lab_app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*"
```

### Step 2: 依存関係追加

```bash
npm install lucide-react zustand react-hook-form zod mathjs date-fns dexie jspdf react-pdf
```

必要なら shadcn/ui を初期化。

```bash
npx shadcn@latest init
```

よく使う UI を追加。

```bash
npx shadcn@latest add button card input textarea select dialog tabs badge separator dropdown-menu table
```

### Step 3: 型定義作成

`types/` 以下に型を作成する。

### Step 4: 計算ロジック作成

`lib/calculations` 以下に以下を作る。

- `pcr.ts`
- `dilution.ts`
- `molarity.ts`
- `custom.ts`
- `index.ts`

### Step 5: サンプルデータ作成

`data/sample-protocols.ts`

### Step 6: UI 作成

- layout
- sidebar
- dashboard
- protocols list
- protocol editor
- calculators
- run mode
- papers

### Step 7: 保存機能

まずは localStorage。  
可能なら dexie で IndexedDB。

### Step 8: PDF 出力

`lib/pdf/exportProtocolPdf.ts` を作る。

### Step 9: 動作確認

以下を確認。

```bash
npm run dev
npm run lint
npm run build
```

---

## 13. 実装時の注意

- いきなり巨大に作らない
- まず動く MVP を優先
- 型安全にする
- 計算ロジックはテストしやすくする
- UI コンポーネントを分割する
- 既存の古いアプリの UI を真似しない
- コード、アイコン、ロゴ、文章はすべて独自にする
- PDF や論文の扱いは著作権に配慮する
- スマホ画面では編集機能を減らす

---

## 14. 完了条件

最初の完了条件は以下。

- `npm run dev` で起動できる
- ホーム画面が表示される
- プロトコル一覧が表示される
- サンプル PCR プロトコルを開ける
- サンプル数を変更すると試薬量が再計算される
- PDF 出力ボタンがある
- タイマーが動く
- カウンターが動く
- 論文管理画面に手入力で論文を追加できる
- PDF URL を入力すると viewer または外部リンクで確認できる
- `npm run build` が通る

---

## 15. Codex への最初の実行指示

以下の順番で実装してください。

1. 現在のディレクトリ `/home/nakamura/dev_app/lab_app` の状態を確認してください。
2. 既存ファイルがある場合は勝手に削除しないでください。
3. Next.js プロジェクトでなければ、Next.js + TypeScript + Tailwind のプロジェクトを初期化してください。
4. 上記のディレクトリ構成、型定義、サンプルデータ、計算ロジックを作成してください。
5. まずは Web 版 MVP を作成してください。
6. デザインは古いスマホアプリ風ではなく、Notion / esa / Linear 風のモダンな Web UI にしてください。
7. プロトコル編集画面では、サンプル数などの変数を変更すると、試薬量・計算結果が即時更新されるようにしてください。
8. PCR、希釈、モル濃度、カスタム計算機を最低限実装してください。
9. タイマー、カウンター、実験メモを実装してください。
10. 論文管理画面を作り、URL/DOI/PDF URL を登録できるようにしてください。
11. PDF URL はサーバーに保存せず、URL参照で viewer 表示または外部リンク表示にしてください。
12. 最後に `npm run lint` と `npm run build` を実行し、エラーがあれば修正してください。
13. 実装内容と残課題を README にまとめてください。
