import { Layout } from '@/components/layout/MainLayout';
import { PapersPage } from '@/components/papers/PapersPage';

export default function PapersRoutePage() {
  return (
    <Layout>
      <div className="px-6 py-8">
        <PapersPage />
      </div>
    </Layout>
  );
}
