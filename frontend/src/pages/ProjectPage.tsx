import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Experiment, DOMChange } from '../types';
import WelcomeModal from '../components/WelcomeModal';
import FeatherIcon from 'feather-icons-react';
import { apiGet, apiPost } from '../utils/api';
import './HomePage.css';

function hasSeenWelcome(): boolean {
  return localStorage.getItem('simple_ab_testing_welcome_seen') === 'true';
}

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);

  const handleNewExperiment = () => {
    if (hasSeenWelcome()) {
      window.open('/visual-selector', '_blank');
    } else {
      setShowWelcomeModal(true);
    }
  };

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await apiGet(`/projects/${projectId}`);
      setProjectName(data.project?.name || 'Project');
    } catch (error) {
      console.error('Failed to fetch project:', error);
    }
  }, [projectId]);

  const fetchExperiments = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await apiGet(`/experiments?projectId=${projectId}`);
      setExperiments(data.experiments || []);
    } catch (error) {
      console.error('Failed to fetch experiments:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
    fetchExperiments();
  }, [fetchProject, fetchExperiments]);

  // Listen for experiments created from the Visual Selector
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'VISUAL_SELECTOR_COMPLETE') {
        const exp = event.data.experiment;
        
        const change: DOMChange = {
          selector: exp.selector,
          type: exp.changeType,
          value: exp.changeValue
        };
        
        if (exp.changeType === 'attribute' && exp.attributeName) {
          (change as any).attribute = exp.attributeName;
        }
        
        const newExperiment: Experiment = {
          id: `exp-${Date.now()}`,
          name: exp.name,
          status: 'paused',
          trafficAllocation: 100,
          project_id: projectId,
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
        
        try {
          await apiPost('/experiments', { experiment: newExperiment });
          await fetchExperiments();
        } catch (error) {
          console.error('Error saving experiment:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [projectId, fetchExperiments]);

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
          <div className="project-page-breadcrumb">
            <button onClick={() => navigate('/')} className="breadcrumb-link">
              <FeatherIcon icon="home" size={14} />
              Dashboard
            </button>
            <FeatherIcon icon="chevron-right" size={14} className="breadcrumb-sep" />
            <span className="breadcrumb-current">{projectName}</span>
          </div>

          <div className="empty-state-home">
            <div className="empty-state-icon-home">No experiments yet</div>
            <h2>Create your first experiment</h2>
            <p>Start testing changes on your website for this project</p>
            <button 
              className="btn btn-primary btn-large"
              onClick={handleNewExperiment}
            >
              New Experiment
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
        <div className="project-page-breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            <FeatherIcon icon="home" size={14} />
            Dashboard
          </button>
          <FeatherIcon icon="chevron-right" size={14} className="breadcrumb-sep" />
          <span className="breadcrumb-current">{projectName}</span>
        </div>

        <div className="home-header">
          <div>
            <h1 className="home-title">{projectName}</h1>
            <p className="home-subtitle">
              {experiments.length} {experiments.length === 1 ? 'experiment' : 'experiments'}
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleNewExperiment}
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
