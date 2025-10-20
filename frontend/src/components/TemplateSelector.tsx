import { useState } from 'react';
import { experimentTemplates, ExperimentTemplate, createExperimentFromTemplate } from '../templates';
import { Experiment } from '../types';
import './TemplateSelector.css';

interface TemplateSelectorProps {
  onSelectTemplate: (experiment: Experiment) => void | Promise<void>;
  onClose: () => void;
}

export default function TemplateSelector({ onSelectTemplate, onClose }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ExperimentTemplate | null>(null);
  const [experimentName, setExperimentName] = useState('');

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'cta', name: 'Call-to-Action' },
    { id: 'content', name: 'Content' },
    { id: 'design', name: 'Design' },
    { id: 'layout', name: 'Layout' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? experimentTemplates 
    : experimentTemplates.filter(t => t.category === selectedCategory);

  const handleTemplateClick = (template: ExperimentTemplate) => {
    setSelectedTemplate(template);
    setExperimentName(template.name);
  };

  const handleCreate = () => {
    if (!selectedTemplate || !experimentName.trim()) {
      alert('Please provide an experiment name');
      return;
    }

    const experiment = createExperimentFromTemplate(selectedTemplate, experimentName);
    onSelectTemplate(experiment);
  };

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="template-modal-header">
          <h2>Choose a Template</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {!selectedTemplate ? (
          <>
            <div className="template-categories">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="templates-grid">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  className="template-card"
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="template-icon">{template.icon}</div>
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                  <div className="template-meta">
                    <span className="template-category">{template.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="template-config">
            <button className="back-btn" onClick={() => setSelectedTemplate(null)}>
              ← Back to Templates
            </button>

            <div className="selected-template-header">
              <div>
                <h3>{selectedTemplate.name}</h3>
                <p>{selectedTemplate.description}</p>
              </div>
            </div>

            <div className="form-group">
              <label>Experiment Name</label>
              <input
                type="text"
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
                placeholder="e.g., Homepage CTA Button Color Test"
              />
              <small style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                You can configure selectors and other details after creating the experiment
              </small>
            </div>

            <div className="template-preview">
              <h4>What's included:</h4>
              <ul>
                <li>✓ Control version (original)</li>
                {selectedTemplate.template.variations.slice(1).map((v, i) => (
                  <li key={i}>✓ {v.name} ({v.changes.length} change{v.changes.length !== 1 ? 's' : ''})</li>
                ))}
                <li>✓ 50/50 traffic split</li>
              </ul>
              <p className="template-note">
                Note: You can customize everything after creating the experiment
              </p>
            </div>

            <div className="template-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedTemplate(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreate}>
                Create Experiment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

