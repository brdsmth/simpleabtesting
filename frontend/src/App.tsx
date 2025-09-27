import { useState } from 'react';
import { Experiment } from './types';
import ExperimentBuilder from './components/ExperimentBuilder';
import ExperimentPreview from './components/ExperimentPreview';
import './App.css';

// example experiment to get started
const exampleExperiment: Experiment = {
  id: "exp-example-demo",
  name: "Button & Text Color Test (Example)",
  status: "active",
  trafficAllocation: 100,
  variations: [
    {
      id: "control",
      name: "Control (Original Blue)",
      weight: 33,
      changes: [
        {
          selector: ".btn-primary",
          type: "text",
          value: "Original Button"
        }
      ]
    },
    {
      id: "variation-a",
      name: "Green Button Variation",
      weight: 33,
      changes: [
        {
          selector: ".btn-primary",
          type: "style",
          value: "background-color: #28a745; border-color: #28a745;"
        },
        {
          selector: ".btn-primary",
          type: "text",
          value: "Green Action Button"
        }
      ]
    },
    {
      id: "variation-b",
      name: "Red Button + Header Text",
      weight: 34,
      changes: [
        {
          selector: ".btn-primary",
          type: "style",
          value: "background-color: #dc3545; border-color: #dc3545;"
        },
        {
          selector: ".btn-primary",
          type: "text",
          value: "Red CTA Button"
        },
        {
          selector: "h1",
          type: "style",
          value: "color: #dc3545;"
        },
        {
          selector: "h1",
          type: "text",
          value: "Simple A/B Testing Demo"
        }
      ]
    }
  ]
};

function App() {
  const [experiments, setExperiments] = useState<Experiment[]>([exampleExperiment]);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(exampleExperiment);

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Simple A/B Testing</h1>
        <p>Build and test your experiments</p>
      </header>

      <div className="app-content">
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
      </div>
    </div>
  );
}

export default App;
