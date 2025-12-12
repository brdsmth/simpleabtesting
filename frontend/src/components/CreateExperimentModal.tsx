import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Experiment, Variation, DOMChange } from '../types';
import './CreateExperimentModal.css';

interface CreateExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experiment: Experiment) => void | Promise<void>;
}

type Step = 'basic' | 'variations' | 'changes' | 'review';

export default function CreateExperimentModal({ isOpen, onClose, onSave }: CreateExperimentModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [name, setName] = useState('');
  const [trafficAllocation, setTrafficAllocation] = useState(100);
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
  const [activeSelectorTarget, setActiveSelectorTarget] = useState<{ variationIndex: number; changeIndex: number } | null>(null);
  const [visualSelectorWindow, setVisualSelectorWindow] = useState<Window | null>(null);

  // Listen for messages from the visual selector tab
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message in modal:', event.data, 'from origin:', event.origin);
      
      // Verify the message is from our origin
      if (event.origin !== window.location.origin) {
        console.log('Message origin mismatch, ignoring');
        return;
      }
      
      if (event.data.type === 'VISUAL_SELECTOR_RESULT') {
        console.log('Visual selector result received:', event.data.selector, 'activeSelectorTarget:', activeSelectorTarget);
        
        if (activeSelectorTarget) {
          const updated = [...variations];
          (updated[activeSelectorTarget.variationIndex].changes[activeSelectorTarget.changeIndex] as any)['selector'] = event.data.selector;
          setVariations(updated);
          setActiveSelectorTarget(null);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeSelectorTarget, variations]);

  // Cleanup: close visual selector window if modal is closed
  useEffect(() => {
    return () => {
      if (visualSelectorWindow && !visualSelectorWindow.closed) {
        visualSelectorWindow.close();
      }
    };
  }, [visualSelectorWindow]);

  const steps: { id: Step; label: string; number: number }[] = [
    { id: 'basic', label: 'Basic Info', number: 1 },
    { id: 'variations', label: 'Variations', number: 2 },
    { id: 'changes', label: 'DOM Changes', number: 3 },
    { id: 'review', label: 'Review', number: 4 }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (currentStep === 'basic') {
      if (!name.trim()) {
        alert('Please enter an experiment name');
        return;
      }
      setCurrentStep('variations');
    } else if (currentStep === 'variations') {
      setCurrentStep('changes');
    } else if (currentStep === 'changes') {
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'variations') {
      setCurrentStep('basic');
    } else if (currentStep === 'changes') {
      setCurrentStep('variations');
    } else if (currentStep === 'review') {
      setCurrentStep('changes');
    }
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
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setCurrentStep('basic');
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

  const handleClose = () => {
    if (window.confirm('Are you sure you want to close? Your changes will be lost.')) {
      resetForm();
      onClose();
    }
  };

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

  const removeVariation = (index: number) => {
    if (variations.length <= 1) {
      alert('You must have at least one variation');
      return;
    }
    
    const updated = variations.filter((_, i) => i !== index);
    // Redistribute weights
    const newWeight = Math.floor(100 / updated.length);
    const redistributed = updated.map(v => ({ ...v, weight: newWeight }));
    setVariations(redistributed);
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
    
    // Open visual selector in a new tab (not window)
    const newWindow = window.open('/visual-selector', '_blank');
    setVisualSelectorWindow(newWindow);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="step-content">
            <h3>Basic Information</h3>
            <p className="step-description">Let's start by naming your experiment and setting traffic allocation.</p>
            
            <div className="form-group">
              <label>Experiment Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Homepage Button Color Test"
                autoFocus
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
              <small className="form-help">Percentage of visitors who will see this experiment</small>
            </div>
          </div>
        );

      case 'variations':
        return (
          <div className="step-content">
            <div className="step-header">
              <div>
                <h3>Variations</h3>
                <p className="step-description">Define the different versions of your experiment.</p>
              </div>
              <button className="btn btn-secondary" onClick={addVariation}>
                + Add Variation
              </button>
            </div>

            <div className="variations-list">
              {variations.map((variation, index) => (
                <div key={variation.id} className="variation-card">
                  <div className="variation-card-header">
                    <h4>Variation {index + 1}</h4>
                    {variations.length > 1 && (
                      <button 
                        className="btn-icon btn-danger"
                        onClick={() => removeVariation(index)}
                        title="Remove variation"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="variation-card-body">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          value={variation.name}
                          onChange={(e) => updateVariation(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Weight (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={variation.weight}
                          onChange={(e) => updateVariation(index, 'weight', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'changes':
        return (
          <div className="step-content">
            <h3>DOM Changes</h3>
            <p className="step-description">Configure what changes each variation should make to the page.</p>
            
            <div className="variations-changes">
              {variations.map((variation, variationIndex) => (
                <div key={variation.id} className="variation-changes-section">
                  <div className="variation-changes-header">
                    <h4>{variation.name}</h4>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => addChange(variationIndex)}
                    >
                      + Add Change
                    </button>
                  </div>

                  {variation.changes.length === 0 ? (
                    <div className="empty-changes">
                      <p>No changes yet. Click "Add Change" to start.</p>
                    </div>
                  ) : (
                    <div className="changes-list">
                      {variation.changes.map((change, changeIndex) => (
                        <div key={changeIndex} className="change-card">
                          <div className="change-row">
                            <div className="form-group selector-group">
                              <label>CSS Selector</label>
                              <div className="selector-input-wrapper">
                                <input
                                  type="text"
                                  placeholder="e.g., .btn-primary"
                                  value={change.selector}
                                  onChange={(e) => updateChange(variationIndex, changeIndex, 'selector', e.target.value)}
                                />
                                <button
                                  className="btn btn-secondary btn-sm pick-btn"
                                  onClick={() => openVisualSelector(variationIndex, changeIndex)}
                                  type="button"
                                  title="Pick element visually"
                                >
                                  Pick Element
                                </button>
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Type</label>
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
                            <div className="form-group">
                              <label>Value</label>
                              <input
                                type="text"
                                placeholder={getPlaceholder(change.type)}
                                value={change.value}
                                onChange={(e) => updateChange(variationIndex, changeIndex, 'value', e.target.value)}
                              />
                            </div>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => removeChange(variationIndex, changeIndex)}
                              title="Remove change"
                            >
                              ×
                            </button>
                          </div>
                          {change.type === 'attribute' && (
                            <div className="form-group attribute-field">
                              <label>Attribute Name</label>
                              <input
                                type="text"
                                placeholder="e.g., href, src"
                                value={change.attribute || ''}
                                onChange={(e) => updateChange(variationIndex, changeIndex, 'attribute', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="step-content">
            <h3>Review & Create</h3>
            <p className="step-description">Review your experiment configuration before creating it.</p>
            
            <div className="review-section">
              <div className="review-item">
                <label>Experiment Name</label>
                <div className="review-value">{name}</div>
              </div>

              <div className="review-item">
                <label>Traffic Allocation</label>
                <div className="review-value">{trafficAllocation}%</div>
              </div>

              <div className="review-item">
                <label>Variations ({variations.length})</label>
                <div className="variations-summary">
                  {variations.map(variation => (
                    <div key={variation.id} className="variation-summary-card">
                      <div className="variation-summary-header">
                        <strong>{variation.name}</strong>
                        <span className="weight-badge">{variation.weight}%</span>
                      </div>
                      <div className="variation-summary-body">
                        {variation.changes.length > 0 ? (
                          <div className="changes-summary">
                            <small>{variation.changes.length} DOM change{variation.changes.length !== 1 ? 's' : ''}</small>
                            <ul>
                              {variation.changes.map((change, idx) => (
                                <li key={idx}>
                                  <code>{change.selector}</code> → {change.type}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <small className="text-muted">No changes (control)</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose}
        size="xlarge"
        showCloseButton={false}
      >
        <div className="create-experiment-modal">
          {/* Progress Steps */}
          <div className="modal-steps">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`step-item ${currentStep === step.id ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-label">{step.label}</div>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="modal-content-area">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="modal-footer">
            <button 
              className="btn btn-secondary" 
              onClick={handleClose}
            >
              Cancel
            </button>
            <div className="modal-footer-right">
              {!isFirstStep && (
                <button 
                  className="btn btn-secondary" 
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
              {!isLastStep ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handleNext}
                >
                  Next
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handleSave}
                >
                  Create Experiment
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
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

