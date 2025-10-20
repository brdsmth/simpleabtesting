import { useState, useEffect } from 'react';
import { Project } from '../types';
import FeatherIcon from 'feather-icons-react';

interface ProjectManagerProps {
  apiKey: string;
  onClose: () => void;
  onProjectsUpdated: () => void;
}

export default function ProjectManager({ apiKey, onClose, onProjectsUpdated }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [apiKey]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/projects?apiKey=${apiKey}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (project: Project) => {
    try {
      const response = await fetch('http://localhost:3000/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, project })
      });

      if (response.ok) {
        await fetchProjects();
        setEditingProject(null);
        setIsCreating(false);
        onProjectsUpdated();
      } else {
        const data = await response.json();
        console.error('Failed to save project:', data);
        alert(data.message || 'Failed to save project');
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project: ' + error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/projects/${projectId}?apiKey=${apiKey}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProjects();
        onProjectsUpdated();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const startCreatingProject = () => {
    setIsCreating(true);
    setEditingProject({
      project_id: `project-${Date.now()}`,
      name: '',
      url: '',
      description: ''
    });
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setIsCreating(false);
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Manage Projects</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p>Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content project-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Projects</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {editingProject ? (
            <ProjectForm
              project={editingProject}
              onSave={handleSaveProject}
              onCancel={cancelEditing}
              isCreating={isCreating}
            />
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <button className="btn btn-primary" onClick={startCreatingProject}>
                  <FeatherIcon icon="plus" size={16} />
                  New Project
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="empty-state">
                  <p>No projects yet</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                    Create your first project to organize your experiments
                  </p>
                </div>
              ) : (
                <div className="projects-list">
                  {projects.map((project) => (
                    <div key={project.project_id} className="project-card">
                      <div className="project-info">
                        <h3>{project.name}</h3>
                        {project.url && (
                          <p className="project-url">{project.url}</p>
                        )}
                        {project.description && (
                          <p className="project-description">{project.description}</p>
                        )}
                      </div>
                      <div className="project-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingProject(project)}
                        >
                          <FeatherIcon icon="edit" size={14} />
                          Edit
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDeleteProject(project.project_id)}
                          style={{ color: 'var(--error)' }}
                        >
                          <FeatherIcon icon="trash-2" size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProjectFormProps {
  project: Project;
  onSave: (project: Project) => void;
  onCancel: () => void;
  isCreating: boolean;
}

function ProjectForm({ project, onSave, onCancel, isCreating }: ProjectFormProps) {
  const [formData, setFormData] = useState(project);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Project name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div className="form-group">
        <label>Project Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="My Website"
          required
        />
      </div>

      <div className="form-group">
        <label>URL</label>
        <input
          type="url"
          value={formData.url || ''}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://example.com"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this project..."
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {isCreating ? 'Create Project' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

