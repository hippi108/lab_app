'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/MainLayout';
import { ProtocolCard } from '@/components/protocol/ProtocolCard';
import { getProtocols } from '@/lib/repositories/protocolRepository';
import type { Protocol } from '@/types/protocol';

export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>(getProtocols());

  useEffect(() => {
    setProtocols(getProtocols());
  }, []);

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
          {protocols.map((protocol) => (
            <ProtocolCard key={protocol.id} protocol={protocol} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
