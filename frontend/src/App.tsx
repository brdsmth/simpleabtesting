import { useState, useEffect } from 'react';
import { Experiment } from './types';
import ExperimentBuilder from './components/ExperimentBuilder';
import ExperimentPreview from './components/ExperimentPreview';
import Analytics from './components/Analytics';
import './App.css';

const API_KEY = 'demo-api-key-123'; // Consistent API key across the app

function App() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [currentView, setCurrentView] = useState<'experiments' | 'analytics'>('experiments');
  const [loading, setLoading] = useState(true);

  // Fetch experiments from API on startup
  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const response = await fetch(`http://localhost:3000/experiments?apiKey=${API_KEY}`);
        if (response.ok) {
          const data = await response.json();
          const apiExperiments = data.experiments || [];
          setExperiments(apiExperiments);
          
          // Select the first experiment by default
          if (apiExperiments.length > 0) {
            setSelectedExperiment(apiExperiments[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch experiments:', error);
        // If API fails, we'll just show empty state
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  const addExperiment = (experiment: Experiment) => {
    setExperiments(prev => [...prev, experiment]);
  };

  const updateExperiment = (updatedExperiment: Experiment) => {
    setExperiments(prev => 
      prev.map(exp => exp.id === updatedExperiment.id ? updatedExperiment : exp)
    );
    if (selectedExperiment?.id === updatedExperiment.id) {
      setSelectedExperiment(updatedExperiment);
    }
  };

  const deleteExperiment = (id: string) => {
    setExperiments(prev => prev.filter(exp => exp.id !== id));
    if (selectedExperiment?.id === id) {
      setSelectedExperiment(null);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Simple A/B Testing</h1>
          <p>Loading experiments...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Simple A/B Testing</h1>
        <p>Build and test your experiments</p>
        <div style={{ marginTop: '1rem' }}>
          <button 
            className={`tab-btn ${currentView === 'experiments' ? 'active' : ''}`}
            onClick={() => setCurrentView('experiments')}
          >
            Experiments
          </button>
          <button 
            className={`tab-btn ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentView('analytics')}
          >
            Analytics
          </button>
        </div>
      </header>

      <div className="app-content">
        {currentView === 'experiments' ? (
          <>
            <div className="sidebar">
              <h2>Experiments</h2>
              <div className="experiments-list">
                {experiments.map(experiment => (
                  <div 
                    key={experiment.id} 
                    className={`experiment-item ${selectedExperiment?.id === experiment.id ? 'selected' : ''}`}
                    onClick={() => setSelectedExperiment(experiment)}
                  >
                    <div className="experiment-name">{experiment.name}</div>
                    <div className="experiment-status">{experiment.status}</div>
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteExperiment(experiment.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button 
                className="new-experiment-btn"
                onClick={() => setSelectedExperiment(null)}
              >
                + New Experiment
              </button>
            </div>

            <div className="main-content">
              {selectedExperiment ? (
                <ExperimentPreview 
                  experiment={selectedExperiment}
                  onUpdate={updateExperiment}
                />
              ) : (
                <ExperimentBuilder 
                  onSave={addExperiment}
                />
              )}
            </div>
          </>
        ) : (
          <div className="main-content" style={{ gridColumn: '1 / -1' }}>
            <Analytics />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
