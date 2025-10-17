import { Experiment } from '../types';
import './ComparisonView.css';

interface ComparisonViewProps {
  experiment: Experiment;
  onClose: () => void;
  onMakePermanent?: () => void;
}

export default function ComparisonView({ experiment, onClose, onMakePermanent }: ComparisonViewProps) {
  const { variations } = experiment;
  
  // Calculate conversion rates (mock data for now)
  const getVariationStats = (_variationId: string) => {
    // In a real app, this would fetch actual analytics data
    const mockViews = Math.floor(Math.random() * 1000) + 500;
    const mockConversions = Math.floor(mockViews * (Math.random() * 0.15 + 0.05));
    const conversionRate = ((mockConversions / mockViews) * 100).toFixed(1);
    
    return {
      views: mockViews,
      conversions: mockConversions,
      conversionRate: parseFloat(conversionRate)
    };
  };

  const variationStats = variations.map(v => ({
    variation: v,
    stats: getVariationStats(v.id)
  }));

  const controlStats = variationStats.find(v => v.variation.id === 'control')?.stats;
  const winner = variationStats.reduce((best, current) => {
    if (!best || current.stats.conversionRate > best.stats.conversionRate) {
      return current;
    }
    return best;
  });

  const calculateImprovement = (rate: number) => {
    if (!controlStats) return 0;
    const controlRate = controlStats.conversionRate;
    return ((rate - controlRate) / controlRate) * 100;
  };

  return (
    <div className="comparison-modal-overlay" onClick={onClose}>
      <div className="comparison-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comparison-header">
          <div>
            <h2>Compare Variations</h2>
            <p className="comparison-subtitle">{experiment.name}</p>
            
            {/* Projected Impact Section */}
            {winner && winner.variation.id !== 'control' && (
              <div className="impact-summary">
                <div className="impact-stat">
                  <span className="impact-label">Expected Improvement</span>
                  <span className="impact-value">+{calculateImprovement(winner.stats.conversionRate).toFixed(1)}%</span>
                </div>
                <div className="impact-stat">
                  <span className="impact-label">Additional Conversions / 1k visits</span>
                  <span className="impact-value">+{Math.round((winner.stats.conversionRate - (controlStats?.conversionRate || 0)) * 10)}</span>
                </div>
              </div>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="comparison-grid">
          {variationStats.map(({ variation, stats }) => {
            const isWinner = winner.variation.id === variation.id && variationStats.length > 1;
            const isControl = variation.id === 'control';
            const improvement = calculateImprovement(stats.conversionRate);

            return (
              <div 
                key={variation.id} 
                className={`comparison-card ${isWinner ? 'winner' : ''} ${isControl ? 'control' : ''}`}
              >
                {isWinner && !isControl && (
                  <div className="winner-ribbon">
                    <span>WINNER</span>
                  </div>
                )}

                <div className="comparison-card-header">
                  <h3>{variation.name}</h3>
                  {isControl && <span className="control-badge">Control</span>}
                  {!isControl && (
                    <span className={`traffic-badge ${variation.weight >= 50 ? 'high' : 'low'}`}>
                      {variation.weight}% traffic
                    </span>
                  )}
                </div>

                <div className="comparison-stats">
                  <div className="stat-item">
                    <span className="stat-label">Conversion Rate</span>
                    <span className="stat-value-huge">{stats.conversionRate}%</span>
                  </div>

                  <div className="stat-row">
                    <div className="stat-item-small">
                      <span className="stat-label">Views</span>
                      <span className="stat-value">{stats.views.toLocaleString()}</span>
                    </div>
                    <div className="stat-item-small">
                      <span className="stat-label">Conversions</span>
                      <span className="stat-value">{stats.conversions.toLocaleString()}</span>
                    </div>
                  </div>

                  {!isControl && (
                    <div className="improvement-section">
                      <div className={`improvement-badge ${improvement > 0 ? 'positive' : improvement < 0 ? 'negative' : 'neutral'}`}>
                        {improvement > 0 ? '↑' : improvement < 0 ? '↓' : '='} {Math.abs(improvement).toFixed(1)}%
                        <span className="improvement-label">vs control</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="comparison-changes">
                  <h4>Changes ({variation.changes.length})</h4>
                  {variation.changes.length === 0 ? (
                    <p className="no-changes">No changes (original version)</p>
                  ) : (
                    <ul className="changes-list">
                      {variation.changes.map((change, idx) => (
                        <li key={idx} className="change-item">
                          <span className="change-selector">{change.selector}</span>
                          <span className="change-arrow">→</span>
                          <span className="change-value">{change.value}</span>
                          {change.attribute && (
                            <span className="change-attribute">({change.attribute})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {onMakePermanent && isWinner && !isControl && (
                  <button 
                    className="make-permanent-btn"
                    onClick={onMakePermanent}
                  >
                    Make This Permanent
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

