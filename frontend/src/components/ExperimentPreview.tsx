import { useState } from 'react';
import { Experiment } from '../types';
import FeatherIcon from 'feather-icons-react';

interface ExperimentPreviewProps {
  experiment: Experiment;
  onUpdate: (experiment: Experiment) => Promise<void>;
}

export default function ExperimentPreview({ experiment, onUpdate }: ExperimentPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(experiment.name);

  const handleStatusChange = async (status: 'active' | 'paused' | 'stopped') => {
    await onUpdate({ ...experiment, status });
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setEditedName(experiment.name);
  };

  const handleNameSave = async () => {
    if (editedName.trim() && editedName.trim() !== experiment.name) {
      await onUpdate({ ...experiment, name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditedName(experiment.name);
    setIsEditingName(false);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  const generateSDKCode = () => {
    return `<!-- Add this script tag to your website -->
<script 
  data-simple-ab="true"
  data-api-key="demo-api-key-123"
  data-api-url="http://localhost:3000"
  data-debug="true"
  src="http://localhost:3002/simple-ab-testing.umd.js">
</script>

<!-- Or initialize programmatically -->
<script src="http://localhost:3002/simple-ab-testing.umd.js"></script>
<script>
  SimpleABTesting.init({
    apiKey: 'demo-api-key-123',
    apiUrl: 'http://localhost:3000',
    debug: true
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isEditingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleNameKeyPress}
                onBlur={handleNameSave}
                autoFocus
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px', 
                  padding: '0.5rem' 
                }}
              />
              <button 
                onClick={handleNameSave}
                style={{ 
                  padding: '0.25rem 0.5rem', 
                  fontSize: '0.8rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✓
              </button>
              <button 
                onClick={handleNameCancel}
                style={{ 
                  padding: '0.25rem 0.5rem', 
                  fontSize: '0.8rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ margin: 0 }}>{experiment.name}</h2>
              <button 
                onClick={handleNameEdit}
                style={{ 
                  padding: '0.25rem 0.5rem', 
                  fontSize: '0.8rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Edit experiment name"
              >
                <FeatherIcon icon="edit-2" width={14} height={14} />
              </button>
            </div>
          )}
        </div>
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
        <input type="text" value={experiment.id} disabled />
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
