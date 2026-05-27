import { sampleProtocols } from '@/data/sample-protocols';
import { Layout } from '@/components/layout/MainLayout';
import { ProtocolCard } from '@/components/protocol/ProtocolCard';

export default function ProtocolsPage() {
  return (
    <Layout>
      <div className="space-y-6 px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">プロトコル一覧</p>
            <h2 className="text-3xl font-semibold text-slate-900">Protocols</h2>
          </div>
          <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
            新規作成
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sampleProtocols.map((protocol) => (
            <ProtocolCard key={protocol.id} protocol={protocol} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
