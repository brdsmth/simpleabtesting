import { useState } from 'react';
import { Experiment, Variation, DOMChange } from '../types';
import FeatherIcon from 'feather-icons-react';
import ComparisonView from './ComparisonView';

interface ExperimentPreviewProps {
  experiment: Experiment;
  onUpdate: (experiment: Experiment) => Promise<void>;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function ExperimentPreview({ experiment, onUpdate, onDuplicate, onDelete }: ExperimentPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(experiment.name);
  const [isEditing, setIsEditing] = useState(false);
  const [editedExperiment, setEditedExperiment] = useState<Experiment>(experiment);
  const [showComparison, setShowComparison] = useState(false);

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

  const handleEditMode = () => {
    setEditedExperiment(experiment);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedExperiment(experiment);
    setIsEditing(false);
  };

  const normalizeWeights = (variations: Variation[]): Variation[] => {
    const totalWeight = variations.reduce((sum, v) => sum + (v.weight || 0), 0);
    
    if (totalWeight === 0) {
      // If all weights are 0, distribute evenly
      const evenWeight = Math.floor(100 / variations.length);
      const remainder = 100 - (evenWeight * variations.length);
      return variations.map((v, index) => ({
        ...v,
        weight: index === 0 ? evenWeight + remainder : evenWeight
      }));
    }
    
    if (totalWeight === 100) {
      return variations; // Already correct
    }
    
    // Normalize proportionally
    const normalized = variations.map(v => ({
      ...v,
      weight: Math.floor((v.weight / totalWeight) * 100)
    }));
    
    // Adjust for rounding errors - add remainder to first variation
    const newTotal = normalized.reduce((sum, v) => sum + v.weight, 0);
    const diff = 100 - newTotal;
    if (diff !== 0 && normalized.length > 0) {
      normalized[0].weight += diff;
    }
    
    return normalized;
  };

  const handleSaveEdit = async () => {
    // Auto-normalize weights to total 100%
    const normalizedExperiment = {
      ...editedExperiment,
      variations: normalizeWeights(editedExperiment.variations)
    };
    
    await onUpdate(normalizedExperiment);
    setIsEditing(false);
  };

  const addVariation = () => {
    const newVariation: Variation = {
      id: `var-${Date.now()}`,
      name: `Variation ${editedExperiment.variations.length}`,
      weight: 0,
      changes: []
    };
    
    // Auto-distribute weights evenly when adding a new variation
    const updatedVariations = [...editedExperiment.variations, newVariation];
    const evenWeight = Math.floor(100 / updatedVariations.length);
    const remainder = 100 - (evenWeight * updatedVariations.length);
    
    const distributedVariations = updatedVariations.map((v, index) => ({
      ...v,
      weight: index === 0 ? evenWeight + remainder : evenWeight
    }));
    
    setEditedExperiment({
      ...editedExperiment,
      variations: distributedVariations
    });
  };

  const deleteVariation = (variationId: string) => {
    if (editedExperiment.variations.length <= 1) {
      alert('You must have at least one variation');
      return;
    }
    
    // Remove the variation and redistribute weights
    const remainingVariations = editedExperiment.variations.filter(v => v.id !== variationId);
    const normalizedVariations = normalizeWeights(remainingVariations);
    
    setEditedExperiment({
      ...editedExperiment,
      variations: normalizedVariations
    });
  };

  const updateVariation = (variationId: string, field: keyof Variation, value: any) => {
    if (field === 'weight') {
      // Auto-adjust other variations when weight changes
      const newWeight = Math.max(0, Math.min(100, parseInt(value) || 0));
      const variations = editedExperiment.variations;
      const currentIndex = variations.findIndex(v => v.id === variationId);
      
      if (currentIndex === -1) return;
      
      const oldWeight = variations[currentIndex].weight;
      const weightDiff = newWeight - oldWeight;
      
      // Calculate how much to adjust other variations
      const otherVariations = variations.filter((_, i) => i !== currentIndex);
      const totalOtherWeight = otherVariations.reduce((sum, v) => sum + v.weight, 0);
      
      const updatedVariations = variations.map((v, i) => {
        if (i === currentIndex) {
          return { ...v, weight: newWeight };
        }
        
        if (otherVariations.length === 0) {
          return v;
        }
        
        // Distribute the difference proportionally among other variations
        const proportion = totalOtherWeight > 0 ? v.weight / totalOtherWeight : 1 / otherVariations.length;
        const adjustment = Math.round(-weightDiff * proportion);
        const newOtherWeight = Math.max(0, v.weight + adjustment);
        
        return { ...v, weight: newOtherWeight };
      });
      
      // Normalize to ensure exactly 100%
      const normalizedVariations = normalizeWeights(updatedVariations);
      
      setEditedExperiment({
        ...editedExperiment,
        variations: normalizedVariations
      });
    } else {
      setEditedExperiment({
        ...editedExperiment,
        variations: editedExperiment.variations.map(v =>
          v.id === variationId ? { ...v, [field]: value } : v
        )
      });
    }
  };

  const addChange = (variationId: string) => {
    const newChange: DOMChange = {
      selector: '',
      type: 'text',
      value: ''
    };
    setEditedExperiment({
      ...editedExperiment,
      variations: editedExperiment.variations.map(v =>
        v.id === variationId
          ? { ...v, changes: [...v.changes, newChange] }
          : v
      )
    });
  };

  const updateChange = (variationId: string, changeIndex: number, field: keyof DOMChange, value: any) => {
    setEditedExperiment({
      ...editedExperiment,
      variations: editedExperiment.variations.map(v =>
        v.id === variationId
          ? {
              ...v,
              changes: v.changes.map((c, idx) =>
                idx === changeIndex ? { ...c, [field]: value } : c
              )
            }
          : v
      )
    });
  };

  const deleteChange = (variationId: string, changeIndex: number) => {
    setEditedExperiment({
      ...editedExperiment,
      variations: editedExperiment.variations.map(v =>
        v.id === variationId
          ? { ...v, changes: v.changes.filter((_, idx) => idx !== changeIndex) }
          : v
      )
    });
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

                Save
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
                Cancel
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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
          <button className="btn btn-secondary" onClick={onDuplicate}>
            Duplicate
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Variations ({isEditing ? editedExperiment.variations.length : experiment.variations.length})</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isEditing ? (
              <>
                <button className="btn btn-secondary" onClick={() => setShowComparison(true)}>
                  Compare Variations
                </button>
                <button className="btn btn-secondary" onClick={handleEditMode}>
                  Edit Variations
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {!isEditing ? (
          /* Read-only view */
          <>
            {experiment.variations.map((variation) => (
              <div key={variation.id} className="variation">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4>{variation.name}</h4>
                  <span style={{ 
                    background: 'var(--bg-tertiary)', 
                    color: 'var(--text-primary)',
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem',
                    fontWeight: 600
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
                          <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <strong>Attribute:</strong> {change.attribute}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No changes defined (control)</p>
                )}
              </div>
            ))}
          </>
        ) : (
          /* Edit mode */
          <>
            {editedExperiment.variations.map((variation, _variationIndex) => (
              <div key={variation.id} className="variation" style={{ border: '2px solid var(--border-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                      <label>Variation Name</label>
                      <input
                        type="text"
                        value={variation.name}
                        onChange={(e) => updateVariation(variation.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Traffic Weight (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={variation.weight}
                        onChange={(e) => updateVariation(variation.id, 'weight', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  {editedExperiment.variations.length > 1 && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => deleteVariation(variation.id)}
                      style={{ background: 'var(--error)', color: 'white' }}
                    >
                      Delete Variation
                    </button>
                  )}
                </div>

                <div className="changes">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong>Changes:</strong>
                    <button className="btn btn-secondary btn-sm" onClick={() => addChange(variation.id)}>
                      Add Change
                    </button>
                  </div>

                  {variation.changes.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                      No changes defined. Click "Add Change" to add DOM modifications.
                    </p>
                  ) : (
                    variation.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="change" style={{ background: 'var(--bg-tertiary)', padding: '1rem', marginBottom: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label>CSS Selector</label>
                            <input
                              type="text"
                              value={change.selector}
                              onChange={(e) => updateChange(variation.id, changeIndex, 'selector', e.target.value)}
                              placeholder=".btn-primary"
                            />
                          </div>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label>Type</label>
                            <select
                              value={change.type}
                              onChange={(e) => updateChange(variation.id, changeIndex, 'type', e.target.value)}
                            >
                              <option value="text">Text Content</option>
                              <option value="html">HTML</option>
                              <option value="style">Style</option>
                              <option value="attribute">Attribute</option>
                              <option value="class">CSS Class</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Value</label>
                          <input
                            type="text"
                            value={change.value}
                            onChange={(e) => updateChange(variation.id, changeIndex, 'value', e.target.value)}
                            placeholder="New value..."
                          />
                        </div>
                        {change.type === 'attribute' && (
                          <div className="form-group" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                            <label>Attribute Name</label>
                            <input
                              type="text"
                              value={change.attribute || ''}
                              onChange={(e) => updateChange(variation.id, changeIndex, 'attribute', e.target.value)}
                              placeholder="href, src, etc."
                            />
                          </div>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => deleteChange(variation.id, changeIndex)}
                          style={{ marginTop: '0.5rem', background: 'var(--error)', color: 'white' }}
                        >
                          Remove Change
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
            <button className="btn btn-primary" onClick={addVariation} style={{ width: '100%', marginTop: '1rem' }}>
              Add New Variation
            </button>
          </>
        )}
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
          {copied ? 'Copied!' : 'Copy Code'}
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

      <div className="preview-section" style={{ borderTop: '2px solid var(--border-primary)', paddingTop: '2rem', marginTop: '3rem' }}>
        <h3 style={{ color: 'var(--error)', marginBottom: '1rem' }}>Danger Zone</h3>
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Once you delete this experiment, there is no going back. Please be certain.
        </p>
        <button 
          className="btn btn-secondary" 
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this experiment? This action cannot be undone.')) {
              onDelete();
            }
          }}
          style={{ background: 'var(--error)', color: 'white', borderColor: 'var(--error)' }}
        >
          Delete Experiment
        </button>
      </div>

      {/* Comparison View Modal */}
      {showComparison && (
        <ComparisonView
          experiment={isEditing ? editedExperiment : experiment}
          onClose={() => setShowComparison(false)}
          onMakePermanent={async () => {
            // Find the winning variation
            const variations = isEditing ? editedExperiment.variations : experiment.variations;
            const winner = variations.find(v => v.id !== 'control');
            
            if (winner) {
              // Update the experiment to mark it as stopped and note the winner
              await onUpdate({
                ...experiment,
                status: 'stopped',
                winningVariation: winner.id,
                stoppedAt: new Date().toISOString()
              } as Experiment);
              
              setShowComparison(false);
            }
          }}
        />
      )}
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
