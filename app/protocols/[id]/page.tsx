import { Layout } from '@/components/layout/MainLayout';
import dynamic from 'next/dynamic';

const ProtocolEditor = dynamic(() => import('@/components/protocol/ProtocolEditor').then((m) => m.ProtocolEditor), { ssr: false });

type Props = {
  params: { id: string };
};

export default function ProtocolDetailPage({ params }: Props) {
  return (
    <Layout>
      <ProtocolEditor id={params.id} />
    </Layout>
  );
}
