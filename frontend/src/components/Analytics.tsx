import { useState, useEffect } from 'react';

interface AnalyticsData {
  apiKey: string;
  summary: {
    totalEvents: number;
    eventTypes: { [key: string]: number };
    experiments: {
      [experimentId: string]: {
        views: number;
        conversions: number;
        variations: {
          [variationId: string]: {
            views: number;
            conversions: number;
          };
        };
      };
    };
    timeRange: {
      earliest: number | null;
      latest: number | null;
    };
  };
}

interface Event {
  id: string;
  experimentId: string;
  variationId: string;
  eventType: string;
  timestamp: number;
  visitorId: string;
  url: string;
  receivedAt: number;
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = 'demo-api-key-123'; // Using demo API key for now

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch summary data
      const summaryResponse = await fetch(`http://localhost:3000/analytics/summary?apiKey=${apiKey}`);
      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch analytics summary');
      }
      const summaryData = await summaryResponse.json();
      setAnalyticsData(summaryData);

      // Fetch recent events
      const eventsResponse = await fetch(`http://localhost:3000/analytics?apiKey=${apiKey}&limit=10`);
      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch recent events');
      }
      const eventsData = await eventsResponse.json();
      setRecentEvents(eventsData.events || []);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Refresh every 5 seconds
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const calculateConversionRate = (views: number, conversions: number) => {
    if (views === 0) return '0%';
    return `${((conversions / views) * 100).toFixed(1)}%`;
  };

  if (loading && !analyticsData) {
    return <div>Loading analytics...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Analytics Dashboard</h2>
        <div style={{ color: 'red', padding: '1rem', background: '#fee', borderRadius: '4px' }}>
          Error: {error}
        </div>
        <button onClick={fetchAnalytics} style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return <div>No analytics data available</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Analytics Dashboard</h2>
        <button onClick={fetchAnalytics} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <h3>Total Events</h3>
          <div className="stat-value">{analyticsData.summary.totalEvents}</div>
        </div>
        <div className="stat-card">
          <h3>Views</h3>
          <div className="stat-value">{analyticsData.summary.eventTypes.view || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Conversions</h3>
          <div className="stat-value">{analyticsData.summary.eventTypes.conversion || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Overall Conversion Rate</h3>
          <div className="stat-value">
            {calculateConversionRate(
              analyticsData.summary.eventTypes.view || 0,
              analyticsData.summary.eventTypes.conversion || 0
            )}
          </div>
        </div>
      </div>

      {/* Experiments Performance */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Experiments Performance</h3>
        {Object.keys(analyticsData.summary.experiments).length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No experiment data available</p>
        ) : (
          Object.entries(analyticsData.summary.experiments).map(([experimentId, data]) => (
            <div key={experimentId} className="experiment-analytics">
              <h4>Experiment: {experimentId}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                <div><strong>Views:</strong> {data.views}</div>
                <div><strong>Conversions:</strong> {data.conversions}</div>
                <div><strong>Conversion Rate:</strong> {calculateConversionRate(data.views, data.conversions)}</div>
              </div>
              
              {/* Variations Performance */}
              <div style={{ marginLeft: '1rem' }}>
                <strong>Variations:</strong>
                {Object.entries(data.variations).map(([variationId, varData]) => (
                  <div key={variationId} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '150px 80px 80px 100px', 
                    gap: '1rem', 
                    padding: '0.5rem',
                    background: '#f9f9f9',
                    margin: '0.25rem 0',
                    borderRadius: '4px'
                  }}>
                    <div><strong>{variationId}</strong></div>
                    <div>{varData.views} views</div>
                    <div>{varData.conversions} conv</div>
                    <div>{calculateConversionRate(varData.views, varData.conversions)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Events */}
      <div>
        <h3>Recent Events</h3>
        {recentEvents.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No recent events</p>
        ) : (
          <div className="events-list">
            {recentEvents.map((event) => (
              <div key={event.id} className="event-item">
                <div style={{ display: 'grid', gridTemplateColumns: '120px 150px 100px 100px 1fr', gap: '1rem', alignItems: 'center' }}>
                  <div><strong>{event.eventType}</strong></div>
                  <div>{event.experimentId}</div>
                  <div>{event.variationId}</div>
                  <div>{formatTimestamp(event.timestamp)}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{event.visitorId}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
