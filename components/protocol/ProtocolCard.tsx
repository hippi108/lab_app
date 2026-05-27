import Link from 'next/link';
import type { Protocol } from '@/types/protocol';

export function ProtocolCard({ protocol }: { protocol: Protocol }) {
  return (
    <Link href={`/protocols/${protocol.id}`} className="group block rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{protocol.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{protocol.description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        {protocol.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
