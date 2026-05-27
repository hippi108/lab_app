import Link from 'next/link';
import { sampleProtocols } from '@/data/sample-protocols';
import { Layout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { ProtocolCard } from '@/components/protocol/ProtocolCard';

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Lab App MVP</p>
            <h1 className="text-3xl font-semibold text-slate-900">実験プロトコルを動的に管理</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              プロトコル、計算機、タイマー、カウンター、論文管理をひとつにまとめる研究室支援アプリです。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/protocols" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
              プロトコル一覧
            </Link>
            <Link href="/calculators" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50">
              計算機へ
            </Link>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">最近のプロトコル</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {sampleProtocols.slice(0, 2).map((protocol) => (
                <ProtocolCard key={protocol.id} protocol={protocol} />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <Card>
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">すぐ使う機能</h2>
                <div className="grid gap-3">
                  <Link href="/run" className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm hover:bg-slate-50">
                    実験 Run を開始
                  </Link>
                  <Link href="/papers" className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm hover:bg-slate-50">
                    論文管理
                  </Link>
                  <Link href="/protocols" className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm hover:bg-slate-50">
                    プロトコル一覧を見る
                  </Link>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </Layout>
  );
}
