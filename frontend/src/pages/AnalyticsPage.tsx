import Analytics from '../components/Analytics';

interface AnalyticsPageProps {
  selectedProjectId: string | null;
}

export default function AnalyticsPage({ selectedProjectId }: AnalyticsPageProps) {
  return (
    <div className="main-content" style={{ gridColumn: '1 / -1' }}>
      <Analytics projectId={selectedProjectId || ''} />
    </div>
  );
}
