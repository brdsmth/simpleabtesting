import { useState } from 'react';
import { Experiment, Variation, DOMChange } from '../types';
import VisualSelector from './VisualSelector';

interface ExperimentBuilderProps {
  onSave: (experiment: Experiment) => void | Promise<void>;
}

export default function ExperimentBuilder({ onSave }: ExperimentBuilderProps) {
  const [name, setName] = useState('');
  const [trafficAllocation, setTrafficAllocation] = useState(100);
  const [showVisualSelector, setShowVisualSelector] = useState(false);
  const [activeSelectorTarget, setActiveSelectorTarget] = useState<{ variationIndex: number; changeIndex: number } | null>(null);
  const [variations, setVariations] = useState<Variation[]>([
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
      changes: []
    }
  ]);

  const addVariation = () => {
    const newVariation: Variation = {
      id: `variation-${Date.now()}`,
      name: `Variation ${String.fromCharCode(65 + variations.length - 1)}`,
      weight: Math.floor(100 / (variations.length + 1)),
      changes: []
    };
    
    // Redistribute weights
    const newWeight = Math.floor(100 / (variations.length + 1));
    const updatedVariations = variations.map(v => ({ ...v, weight: newWeight }));
    
    setVariations([...updatedVariations, newVariation]);
  };

  const updateVariation = (index: number, field: keyof Variation, value: any) => {
    const updated = [...variations];
    (updated[index] as any)[field] = value;
    setVariations(updated);
  };

  const addChange = (variationIndex: number) => {
    const newChange: DOMChange = {
      selector: '',
      type: 'text',
      value: ''
    };
    
    const updated = [...variations];
    updated[variationIndex].changes.push(newChange);
    setVariations(updated);
  };

  const updateChange = (variationIndex: number, changeIndex: number, field: keyof DOMChange, value: any) => {
    const updated = [...variations];
    (updated[variationIndex].changes[changeIndex] as any)[field] = value;
    setVariations(updated);
  };

  const removeChange = (variationIndex: number, changeIndex: number) => {
    const updated = [...variations];
    updated[variationIndex].changes.splice(changeIndex, 1);
    setVariations(updated);
  };

  const openVisualSelector = (variationIndex: number, changeIndex: number) => {
    setActiveSelectorTarget({ variationIndex, changeIndex });
    setShowVisualSelector(true);
  };

  const handleSelectorSelected = (selector: string) => {
    if (activeSelectorTarget) {
      updateChange(
        activeSelectorTarget.variationIndex,
        activeSelectorTarget.changeIndex,
        'selector',
        selector
      );
    }
    setShowVisualSelector(false);
    setActiveSelectorTarget(null);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter an experiment name');
      return;
    }

    const experiment: Experiment = {
      id: `exp-${Date.now()}`,
      name: name.trim(),
      status: 'active',
      trafficAllocation,
      variations
    };

    onSave(experiment);
    
    // Reset form
    setName('');
    setTrafficAllocation(100);
    setVariations([
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
        changes: []
      }
    ]);
  };

  return (
    <div>
      <h2>Create New Experiment</h2>
      
      <div className="form-group">
        <label>Experiment Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Homepage Button Color Test"
        />
      </div>

      <div className="form-group">
        <label>Traffic Allocation (%)</label>
        <input
          type="number"
          min="1"
          max="100"
          value={trafficAllocation}
          onChange={(e) => setTrafficAllocation(parseInt(e.target.value) || 100)}
        />
      </div>

      <div className="variations">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Variations</h3>
          <button className="btn btn-secondary" onClick={addVariation}>
            + Add Variation
          </button>
        </div>

        {variations.map((variation, variationIndex) => (
          <div key={variation.id} className="variation">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label>Name</label>
                <input
                  type="text"
                  value={variation.name}
                  onChange={(e) => updateVariation(variationIndex, 'name', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ width: '100px', margin: 0 }}>
                <label>Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={variation.weight}
                  onChange={(e) => updateVariation(variationIndex, 'weight', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="changes">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4>DOM Changes</h4>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  onClick={() => addChange(variationIndex)}
                >
                  + Add Change
                </button>
              </div>

              {variation.changes.map((change, changeIndex) => (
                <div key={changeIndex} className="change">
                  <div className="change-row">
                    <div className="form-group" style={{ margin: 0, position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="CSS Selector (e.g., .btn-primary)"
                        value={change.selector}
                        onChange={(e) => updateChange(variationIndex, changeIndex, 'selector', e.target.value)}
                      />
                      <button
                        className="btn btn-secondary"
                        style={{ 
                          position: 'absolute', 
                          right: '0.5rem', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.75rem',
                          height: 'auto'
                        }}
                        onClick={() => openVisualSelector(variationIndex, changeIndex)}
                        type="button"
                      >
                        🎯 Pick
                      </button>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <select
                        value={change.type}
                        onChange={(e) => updateChange(variationIndex, changeIndex, 'type', e.target.value)}
                      >
                        <option value="text">Text</option>
                        <option value="html">HTML</option>
                        <option value="style">Style</option>
                        <option value="attribute">Attribute</option>
                        <option value="class">Class</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <input
                        type="text"
                        placeholder={getPlaceholder(change.type)}
                        value={change.value}
                        onChange={(e) => updateChange(variationIndex, changeIndex, 'value', e.target.value)}
                      />
                    </div>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      onClick={() => removeChange(variationIndex, changeIndex)}
                    >
                      ×
                    </button>
                  </div>
                  {change.type === 'attribute' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Attribute name (e.g., href, src)"
                        value={change.attribute || ''}
                        onChange={(e) => updateChange(variationIndex, changeIndex, 'attribute', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Experiment
        </button>
      </div>

      {showVisualSelector && (
        <VisualSelector
          onSelectElement={handleSelectorSelected}
          onClose={() => {
            setShowVisualSelector(false);
            setActiveSelectorTarget(null);
          }}
        />
      )}
    </div>
  );
}

function getPlaceholder(type: string): string {
  switch (type) {
    case 'text': return 'New text content';
    case 'html': return '<strong>New HTML</strong>';
    case 'style': return 'color: red; background: blue';
    case 'attribute': return 'Attribute value';
    case 'class': return 'add:new-class or remove:old-class';
    default: return 'Value';
  }
}
