import { useState, useEffect } from 'react';
import { Experiment } from '../types';

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
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = 'demo-api-key-123'; // Using demo API key for now

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch experiments first to get names
      const experimentsResponse = await fetch(`http://localhost:3000/experiments?apiKey=${apiKey}`);
      if (experimentsResponse.ok) {
        const experimentsData = await experimentsResponse.json();
        setExperiments(experimentsData.experiments || []);
      }

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

  const calculateConversionRateValue = (views: number, conversions: number) => {
    if (views === 0) return 0;
    return (conversions / views) * 100;
  };

  const calculateImprovement = (controlRate: number, variationRate: number) => {
    if (controlRate === 0) return 0;
    return ((variationRate - controlRate) / controlRate) * 100;
  };

  // Simple statistical significance calculation (Z-test for proportions)
  const calculateSignificance = (views1: number, conversions1: number, views2: number, conversions2: number) => {
    if (views1 < 100 || views2 < 100) return { isSignificant: false, confidence: 0 };
    
    const p1 = conversions1 / views1;
    const p2 = conversions2 / views2;
    const pPooled = (conversions1 + conversions2) / (views1 + views2);
    
    const se = Math.sqrt(pPooled * (1 - pPooled) * (1/views1 + 1/views2));
    const zScore = Math.abs((p1 - p2) / se);
    
    // Simple confidence level based on Z-score
    let confidence = 0;
    if (zScore >= 1.96) confidence = 95;  // 95% confidence
    else if (zScore >= 1.645) confidence = 90;  // 90% confidence
    else if (zScore >= 1.28) confidence = 80;  // 80% confidence
    
    return {
      isSignificant: zScore >= 1.96,
      confidence,
      zScore
    };
  };

  const getExperimentName = (experimentId: string): string => {
    const experiment = experiments.find(exp => exp.id === experimentId);
    return experiment?.name || experimentId;
  };

  const getVariationName = (experimentId: string, variationId: string): string => {
    const experiment = experiments.find(exp => exp.id === experimentId);
    if (!experiment) return variationId;
    
    const variation = experiment.variations.find(v => v.id === variationId);
    return variation?.name || variationId;
  };

  const getWinnerForExperiment = (experimentId: string) => {
    const expData = analyticsData?.summary.experiments[experimentId];
    if (!expData) return null;

    const variations = Object.entries(expData.variations);
    if (variations.length < 2) return null;

    // Find control
    const control = variations.find(([id]) => id === 'control');
    if (!control) return null;

    const [_controlId, controlData] = control;
    const controlRate = calculateConversionRateValue(controlData.views, controlData.conversions);

    // Find best performing variation
    let bestVariation = null;
    let bestImprovement = 0;
    let bestSignificance = { isSignificant: false, confidence: 0 };

    for (const [varId, varData] of variations) {
      if (varId === 'control') continue;
      
      const varRate = calculateConversionRateValue(varData.views, varData.conversions);
      const improvement = calculateImprovement(controlRate, varRate);
      const significance = calculateSignificance(
        controlData.views, 
        controlData.conversions,
        varData.views,
        varData.conversions
      );

      if (improvement > bestImprovement) {
        bestImprovement = improvement;
        bestVariation = { id: varId, data: varData, rate: varRate };
        bestSignificance = significance;
      }
    }

    if (bestVariation && bestImprovement > 0) {
      return {
        variationId: bestVariation.id,
        improvement: bestImprovement,
        ...bestSignificance,
        controlRate,
        variationRate: bestVariation.rate
      };
    }

    return null;
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

      {/* Winner Callouts */}
      {Object.keys(analyticsData.summary.experiments).length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>Experiment Results</h3>
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
            {Object.entries(analyticsData.summary.experiments).map(([experimentId, _data]) => {
              const winner = getWinnerForExperiment(experimentId);
              
              return (
                <div key={experimentId} className="winner-card">
                  <div className="winner-card-header">
                    <h4>{getExperimentName(experimentId)}</h4>
                    {winner && winner.improvement > 0 ? (
                      <span className={`winner-badge ${winner.isSignificant ? 'significant' : 'trending'}`}>
                        {winner.isSignificant ? `Winner ${winner.confidence}%` : 'Trending'}
                      </span>
                    ) : (
                      <span className="neutral-badge">In Progress</span>
                    )}
                  </div>
                  
                  {winner && winner.improvement > 0 ? (
                    <div className="winner-content">
                      <p className="winner-message">
                        <strong>{getVariationName(experimentId, winner.variationId)}</strong> is performing{' '}
                        <span className="improvement-value">
                          {winner.improvement.toFixed(1)}% better
                        </span> than control
                      </p>
                      <div className="winner-stats">
                        <div className="stat-compare">
                          <span className="stat-label">Control</span>
                          <span className="stat-value-lg">{winner.controlRate.toFixed(1)}%</span>
                        </div>
                        <div className="stat-arrow">→</div>
                        <div className="stat-compare winner-highlight">
                          <span className="stat-label">Winner</span>
                          <span className="stat-value-lg">{winner.variationRate.toFixed(1)}%</span>
                        </div>
                      </div>
                      {winner.isSignificant ? (
                        <p className="significance-message">
                          Statistically significant at {winner.confidence}% confidence level
                        </p>
                      ) : (
                        <p className="significance-message warning">
                          More data needed for statistical significance (currently tracking trends)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="winner-content">
                      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        Collecting data... No clear winner yet.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Experiments Performance Table */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Detailed Performance</h3>
        {Object.keys(analyticsData.summary.experiments).length === 0 ? (
          <div className="empty-state">
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
              No experiment data available
            </p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Start an experiment and collect some data to see analytics here
            </p>
          </div>
        ) : (
          <div className="experiments-table">
            <div className="experiments-header">
              <div>Experiment</div>
              <div>Variation</div>
              <div>Views</div>
              <div>Conversions</div>
              <div>Conversion Rate</div>
              <div>Performance</div>
            </div>
            <div className="experiments-list">
              {Object.entries(analyticsData.summary.experiments).map(([experimentId, data]) => {
                const variations = Object.entries(data.variations);
                const controlData = variations.find(([id]) => id === 'control')?.[1];
                const controlRate = controlData ? calculateConversionRateValue(controlData.views, controlData.conversions) : 0;

                return (
                  <div key={experimentId}>
                    {variations.map(([variationId, varData], index) => {
                      const varRate = calculateConversionRateValue(varData.views, varData.conversions);
                      const improvement = variationId === 'control' ? 0 : calculateImprovement(controlRate, varRate);
                      const isWinner = improvement > 0 && improvement >= 5; // 5% threshold for "winner" indicator

                      return (
                        <div key={variationId} className="experiment-row">
                          <div className="exp-col-experiment">
                            {index === 0 ? getExperimentName(experimentId) : ''}
                          </div>
                          <div className="exp-col-variation">
                            <span className={`variation-badge ${variationId === 'control' ? 'variation-control' : 'variation-test'}`}>
                              {getVariationName(experimentId, variationId)}
                            </span>
                          </div>
                          <div className="exp-col-views">{varData.views}</div>
                          <div className="exp-col-conversions">{varData.conversions}</div>
                          <div className="exp-col-rate">
                            <span className="conversion-rate">
                              {calculateConversionRate(varData.views, varData.conversions)}
                            </span>
                          </div>
                          <div className="exp-col-performance">
                            {variationId === 'control' ? (
                              <span className="performance-baseline">Baseline</span>
                            ) : improvement === 0 ? (
                              <span className="performance-neutral">—</span>
                            ) : (
                              <span className={`performance-indicator ${improvement > 0 ? 'positive' : 'negative'} ${isWinner ? 'winner' : ''}`}>
                                {improvement > 0 ? '↑' : '↓'} {Math.abs(improvement).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                        <div className="exp-col-performance"></div>
                      </div>
                    )}
                  </div>
                );
              })}
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
                  <div className="event-col-experiment">{getExperimentName(event.experimentId)}</div>
                  <div className="event-col-variation">{getVariationName(event.experimentId, event.variationId)}</div>
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
