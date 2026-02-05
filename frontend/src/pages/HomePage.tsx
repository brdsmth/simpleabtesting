import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Experiment, DOMChange } from '../types';
import WelcomeModal from '../components/WelcomeModal';
import FeatherIcon from 'feather-icons-react';
import { API_URL } from '../config';
import './HomePage.css';

const API_KEY = 'demo-api-key-123';

interface HomePageProps {
  selectedProjectId: string | null;
}

export default function HomePage({ selectedProjectId }: HomePageProps) {
  const navigate = useNavigate();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExperiments = useCallback(async () => {
    try {
      setLoading(true);
      
      let url = `${API_URL}/experiments?apiKey=${API_KEY}`;
      if (selectedProjectId) {
        url += `&projectId=${selectedProjectId}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const apiExperiments = data.experiments || [];
        setExperiments(apiExperiments);
      }
    } catch (error) {
      console.error('Failed to fetch experiments:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  // Listen for experiments created from the Visual Selector
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      console.log('HomePage received message:', event.data, 'from origin:', event.origin);
      
      // Verify the message is from our origin
      if (event.origin !== window.location.origin) {
        console.log('Message origin mismatch, ignoring');
        return;
      }
      
      if (event.data.type === 'VISUAL_SELECTOR_COMPLETE') {
        console.log('Complete experiment received from visual selector:', event.data.experiment);
        
        const exp = event.data.experiment;
        
        // Create the DOM change object
        const change: DOMChange = {
          selector: exp.selector,
          type: exp.changeType,
          value: exp.changeValue
        };
        
        if (exp.changeType === 'attribute' && exp.attributeName) {
          (change as any).attribute = exp.attributeName;
        }
        
        // Create the full experiment object
        const newExperiment: Experiment = {
          id: `exp-${Date.now()}`,
          name: exp.name,
          status: 'paused',
          trafficAllocation: 100,
          variations: [
            {
              id: 'control',
              name: 'Control (Original)',
              weight: 50,
              changes: []
            },
            {
              id: 'variation-a',
              name: 'Variation A',
              weight: 50,
              changes: [change]
            }
          ]
        };
        
        // Add project_id if one is selected
        if (selectedProjectId) {
          newExperiment.project_id = selectedProjectId;
        }
        
        // Save to API
        try {
          const response = await fetch(`${API_URL}/experiments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              apiKey: API_KEY,
              experiment: newExperiment
            })
          });

          if (response.ok) {
            console.log('Experiment saved successfully');
            // Refresh the experiments list
            await fetchExperiments();
          } else {
            console.error('Failed to save experiment');
          }
        } catch (error) {
          console.error('Error saving experiment:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedProjectId, fetchExperiments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--success)';
      case 'paused': return 'var(--warning)';
      case 'stopped': return 'var(--text-tertiary)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--success-bg)';
      case 'paused': return 'var(--warning-bg)';
      case 'stopped': return 'var(--bg-secondary)';
      default: return 'var(--bg-secondary)';
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-content">
          <div className="loading-state">Loading experiments...</div>
        </div>
      </div>
    );
  }

  if (experiments.length === 0) {
    return (
      <div className="home-page">
        <div className="home-content">
          <div className="empty-state-home">
            <div className="empty-state-icon-home">No experiments yet</div>
            <h2>Ready to start testing?</h2>
            <p>Create your first A/B test and start optimizing your website</p>
            <button 
              className="btn btn-primary btn-large"
              onClick={() => setShowWelcomeModal(true)}
            >
              Get Started
            </button>
          </div>
        </div>

        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-content">
        <div className="home-header">
          <div>
            <h1 className="home-title">Your Experiments</h1>
            <p className="home-subtitle">
              {experiments.length} {experiments.length === 1 ? 'experiment' : 'experiments'} running
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowWelcomeModal(true)}
          >
            <FeatherIcon icon="plus" size={16} />
            New Experiment
          </button>
        </div>

        <div className="experiments-grid">
          {experiments.map((experiment) => (
            <div key={experiment.id} className="experiment-card">
              <div className="experiment-card-header">
                <div className="experiment-card-title-row">
                  <h3 className="experiment-card-title">{experiment.name}</h3>
                  <span 
                    className="experiment-status-badge"
                    style={{
                      background: getStatusBgColor(experiment.status),
                      color: getStatusColor(experiment.status)
                    }}
                  >
                    {experiment.status}
                  </span>
                </div>
              </div>

              <div className="experiment-card-body">
                <div className="experiment-stat">
                  <div className="experiment-stat-label">Variations</div>
                  <div className="experiment-stat-value">
                    {experiment.variations.length}
                  </div>
                </div>
                <div className="experiment-stat">
                  <div className="experiment-stat-label">Traffic</div>
                  <div className="experiment-stat-value">
                    {experiment.trafficAllocation}%
                  </div>
                </div>
                <div className="experiment-stat">
                  <div className="experiment-stat-label">Changes</div>
                  <div className="experiment-stat-value">
                    {experiment.variations.reduce((sum, v) => sum + v.changes.length, 0)}
                  </div>
                </div>
              </div>

              <div className="experiment-card-footer">
                <button 
                  className="btn btn-secondary btn-sm experiment-card-btn"
                  onClick={() => navigate('/analytics')}
                >
                  <FeatherIcon icon="bar-chart-2" size={14} />
                  View Analytics
                </button>
                <button 
                  className="btn btn-secondary btn-sm experiment-card-btn"
                  onClick={() => navigate('/experiments')}
                >
                  <FeatherIcon icon="settings" size={14} />
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </div>
  );
}

