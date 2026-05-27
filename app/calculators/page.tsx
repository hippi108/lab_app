import { Layout } from '@/components/layout/MainLayout';
import { CalculatorPage } from '@/components/calculators/CalculatorPage';

export default function CalculatorsPage() {
  return (
    <Layout>
      <div className="px-6 py-8">
        <CalculatorPage />
      </div>
    </Layout>
  );
}
