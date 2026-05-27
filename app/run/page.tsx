import { Layout } from '@/components/layout/MainLayout';
import { RunPage } from '@/components/run/RunPage';

export default function RunRoutePage() {
  return (
    <Layout>
      <div className="px-6 py-8">
        <RunPage />
      </div>
    </Layout>
  );
}
