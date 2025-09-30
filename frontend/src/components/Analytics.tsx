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
        <button 
          className="btn btn-primary" 
          onClick={fetchAnalytics} 
          style={{ marginTop: '1rem' }}
        >
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
        <button 
          className={`btn btn-secondary ${loading ? 'btn-loading' : ''}`}
          onClick={fetchAnalytics} 
          disabled={loading}
        >
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
          <div className="experiments-table">
            <div className="experiments-header">
              <div>Experiment</div>
              <div>Variation</div>
              <div>Views</div>
              <div>Conversions</div>
              <div>Conversion Rate</div>
            </div>
            <div className="experiments-list">
              {Object.entries(analyticsData.summary.experiments).map(([experimentId, data]) => (
                <div key={experimentId}>
                  {Object.entries(data.variations).map(([variationId, varData], index) => (
                    <div key={variationId} className="experiment-row">
                      <div className="exp-col-experiment">
                        {index === 0 ? experimentId : ''}
                      </div>
                      <div className="exp-col-variation">
                        <span className={`variation-badge ${variationId === 'control' ? 'variation-control' : 'variation-test'}`}>
                          {variationId}
                        </span>
                      </div>
                      <div className="exp-col-views">{varData.views}</div>
                      <div className="exp-col-conversions">{varData.conversions}</div>
                      <div className="exp-col-rate">
                        <span className="conversion-rate">
                          {calculateConversionRate(varData.views, varData.conversions)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(data.variations).length > 1 && (
                    <div className="experiment-total">
                      <div className="exp-col-experiment"></div>
                      <div className="exp-col-variation">
                        <strong>Total</strong>
                      </div>
                      <div className="exp-col-views"><strong>{data.views}</strong></div>
                      <div className="exp-col-conversions"><strong>{data.conversions}</strong></div>
                      <div className="exp-col-rate">
                        <strong className="conversion-rate">
                          {calculateConversionRate(data.views, data.conversions)}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Events */}
      <div>
        <h3>Recent Events</h3>
        {recentEvents.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No recent events</p>
        ) : (
          <div className="events-table">
            <div className="events-header">
              <div>Event Type</div>
              <div>Experiment ID</div>
              <div>Variation</div>
              <div>Timestamp</div>
              <div>Visitor ID</div>
            </div>
            <div className="events-list">
              {recentEvents.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-col-type">
                    <span className={`event-type-badge event-type-${event.eventType}`}>{event.eventType}</span>
                  </div>
                  <div className="event-col-experiment">{event.experimentId}</div>
                  <div className="event-col-variation">{event.variationId}</div>
                  <div className="event-col-timestamp">{formatTimestamp(event.timestamp)}</div>
                  <div className="event-col-visitor">{event.visitorId}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
