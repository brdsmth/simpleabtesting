import { useState, useEffect } from 'react';
import { Experiment } from '../types';
import ExperimentBuilder from '../components/ExperimentBuilder';
import ExperimentPreview from '../components/ExperimentPreview';
import Toast, { ToastType } from '../components/Toast';
import TemplateSelector from '../components/TemplateSelector';

const API_KEY = 'demo-api-key-123'; // Consistent API key across the app

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'stopped'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'performance'>('recent');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

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

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const addExperiment = (experiment: Experiment) => {
    setExperiments(prev => [...prev, experiment]);
    showToast('Experiment created successfully!', 'success');
  };

  const handleTemplateSelected = (experiment: Experiment) => {
    setExperiments(prev => [...prev, experiment]);
    setSelectedExperiment(experiment);
    setShowTemplateSelector(false);
    showToast('Experiment created from template!', 'success');
  };

  const updateExperiment = async (updatedExperiment: Experiment) => {
    try {
      // Save to API first
      const response = await fetch('http://localhost:3000/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: API_KEY,
          experiment: updatedExperiment
        })
      });

      if (response.ok) {
        // Update local state only if API save was successful
        setExperiments(prev => 
          prev.map(exp => exp.id === updatedExperiment.id ? updatedExperiment : exp)
        );
        if (selectedExperiment?.id === updatedExperiment.id) {
          setSelectedExperiment(updatedExperiment);
        }
        showToast('Experiment updated successfully!', 'success');
      } else {
        console.error('Failed to update experiment in API');
        showToast('Failed to save changes. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error updating experiment:', error);
      showToast('Failed to save changes. Please try again.', 'error');
    }
  };

  const deleteExperiment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this experiment?')) {
      setExperiments(prev => prev.filter(exp => exp.id !== id));
      if (selectedExperiment?.id === id) {
        setSelectedExperiment(null);
      }
      showToast('Experiment deleted', 'info');
    }
  };

  const duplicateExperiment = (experiment: Experiment) => {
    const duplicated: Experiment = {
      ...experiment,
      id: `exp-${Date.now()}`,
      name: `${experiment.name} (Copy)`,
      status: 'paused'
    };
    setExperiments(prev => [...prev, duplicated]);
    setSelectedExperiment(duplicated);
    showToast('Experiment duplicated successfully!', 'success');
  };

  // Filter and sort experiments
  const filteredAndSortedExperiments = experiments
    .filter(exp => {
      // Filter by search query
      const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'performance':
          // Sort by number of variations (placeholder - we'll improve this with actual metrics)
          return b.variations.length - a.variations.length;
        case 'recent':
        default:
          // Most recently created first
          return b.id.localeCompare(a.id);
      }
    });

  if (loading) {
    return (
      <>
        <div className="main-content" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading experiments...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Experiments</h2>
          
          {/* Search Bar */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filters */}
          <div className="sidebar-filters">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="stopped">Stopped</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="filter-select"
            >
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="performance">Performance</option>
            </select>
          </div>
        </div>

        <div className="experiments-list">
          {filteredAndSortedExperiments.length === 0 ? (
            <div className="empty-state">
              {searchQuery || statusFilter !== 'all' ? (
                <>
                  <p>No experiments match your filters</p>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    style={{ marginTop: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <p>No experiments yet</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                    Click "New Experiment" to get started
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredAndSortedExperiments.map(experiment => (
              <div 
                key={experiment.id} 
                className={`experiment-item ${selectedExperiment?.id === experiment.id ? 'selected' : ''}`}
                onClick={() => setSelectedExperiment(experiment)}
              >
                <div className="experiment-header">
                  <div className="experiment-name">{experiment.name}</div>
                </div>
                
                <div className="experiment-meta">
                  <span className={`status-badge status-${experiment.status}`}>
                    {experiment.status}
                  </span>
                  <span className="meta-item">
                    {experiment.variations.length} version{experiment.variations.length !== 1 ? 's' : ''}
                  </span>
                  <span className="meta-item">
                    {experiment.trafficAllocation}% traffic
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="sidebar-actions">
          <button 
            className="new-experiment-btn template-btn"
            onClick={() => setShowTemplateSelector(true)}
            title="Start from a pre-built template"
          >
            Templates
          </button>
          <button 
            className="new-experiment-btn"
            onClick={() => setSelectedExperiment(null)}
          >
            + New
          </button>
        </div>
      </div>

      <div className="main-content">
        {selectedExperiment ? (
          <ExperimentPreview 
            experiment={selectedExperiment}
            onUpdate={updateExperiment}
            onDuplicate={() => duplicateExperiment(selectedExperiment)}
            onDelete={() => deleteExperiment(selectedExperiment.id)}
          />
        ) : (
          <ExperimentBuilder 
            onSave={addExperiment}
          />
        )}
      </div>

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={handleTemplateSelected}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </>
  );
}
