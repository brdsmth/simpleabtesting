import { useState } from 'react';
import { Experiment } from '../types';

interface ExperimentPreviewProps {
  experiment: Experiment;
  onUpdate: (experiment: Experiment) => void;
}

export default function ExperimentPreview({ experiment, onUpdate }: ExperimentPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleStatusChange = (status: 'active' | 'paused' | 'stopped') => {
    onUpdate({ ...experiment, status });
  };

  const generateSDKCode = () => {
    const experimentData = JSON.stringify([experiment], null, 2);
    return `<!-- Add this script tag to your website -->
      <script 
        data-simple-ab="true"
        data-debug="true" 
        data-experiments='${experimentData.replace(/'/g, "&apos;")}'
        src="http://localhost:3002/simple-ab-testing.umd.js">
      </script>

      <!-- Or initialize programmatically -->
      <script src="http://localhost:3002/simple-ab-testing.umd.js"></script>
      <script>
        SimpleABTesting.init({
          debug: true,
          experiments: ${experimentData}
        });
      </script>`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateSDKCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openDemo = async () => {
    try {
      // Use the consistent demo API key instead of generating temporary ones
      const apiKey = 'demo-api-key-123';
      
      // Store/update the experiment in the API with the demo key
      const response = await fetch('http://localhost:3000/demo/store-experiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey,
          experiment: experiment
        })
      });
      
      if (response.ok) {
        // Open demo with the consistent API key
        const demoUrl = `http://localhost:8082?apiKey=${apiKey}`;
        window.open(demoUrl, '_blank');
      } else {
        console.error('Failed to store experiment for demo');
        // Fallback: open demo with default API key
        window.open('http://localhost:8082', '_blank');
      }
    } catch (error) {
      console.error('Error opening demo:', error);
      // Fallback: open demo with default API key  
      window.open('http://localhost:8082', '_blank');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{experiment.name}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={experiment.status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="btn"
            style={{ background: getStatusColor(experiment.status) }}
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="stopped">Stopped</option>
          </select>
          <button className="btn btn-primary" onClick={openDemo}>
            Open Demo
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Experiment ID</label>
        <input type="text" value={experiment.id} readOnly />
      </div>

      <div className="form-group">
        <label>Traffic Allocation</label>
        <input type="text" value={`${experiment.trafficAllocation}%`} readOnly />
      </div>

      <div className="variations">
        <h3>Variations ({experiment.variations.length})</h3>
        {experiment.variations.map((variation) => (
          <div key={variation.id} className="variation">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4>{variation.name}</h4>
              <span style={{ 
                background: '#e5e7eb', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px', 
                fontSize: '0.8rem' 
              }}>
                {variation.weight}% traffic
              </span>
            </div>

            {variation.changes.length > 0 ? (
              <div className="changes">
                <strong>DOM Changes:</strong>
                {variation.changes.map((change, index) => (
                  <div key={index} className="change">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <div><strong>Selector:</strong> {change.selector}</div>
                      <div><strong>Type:</strong> {change.type}</div>
                      <div><strong>Value:</strong> {change.value}</div>
                    </div>
                    {change.attribute && (
                      <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#666' }}>
                        <strong>Attribute:</strong> {change.attribute}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No changes defined (control)</p>
            )}
          </div>
        ))}
      </div>

      <div className="preview-section">
        <h3>SDK Integration Code</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Copy this code and add it to your website to start running the experiment:
        </p>
        <div className="sdk-code">
          {generateSDKCode()}
        </div>
        <button className="copy-btn" onClick={copyToClipboard}>
          {copied ? '✓ Copied!' : 'Copy Code'}
        </button>
      </div>

      <div className="preview-section">
        <h3>Test Your Experiment</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Use the demo page to see how your experiment works:
        </p>
        <button className="btn btn-primary" onClick={openDemo}>
          Open Demo Page
        </button>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
          The demo page will show your experiment in action. Refresh to see different variations.
        </p>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return '#10b981';
    case 'paused': return '#f59e0b';
    case 'stopped': return '#ef4444';
    default: return '#6b7280';
  }
}
