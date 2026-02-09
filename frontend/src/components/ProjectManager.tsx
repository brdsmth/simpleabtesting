import { useState, useEffect } from 'react';
import { Project } from '../types';
import FeatherIcon from 'feather-icons-react';
import { apiGet, apiPost, apiDelete } from '../utils/api';

interface ProjectManagerProps {
  onClose: () => void;
  onProjectsUpdated: () => void;
}

export default function ProjectManager({ onClose, onProjectsUpdated }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [showArchived]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const includeArchived = showArchived ? 'true' : 'false';
      const data = await apiGet(`/projects?includeArchived=${includeArchived}`);
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (project: Project) => {
    try {
      await apiPost('/projects', { project });
      await fetchProjects();
      setEditingProject(null);
      setIsCreating(false);
      onProjectsUpdated();
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project: ' + error);
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to archive this project?\n\nThis will also archive all experiments in this project. Archived items won\'t be visible but will remain in the database.')) {
      return;
    }

    try {
      const data = await apiDelete(`/projects/${projectId}`);
      await fetchProjects();
      onProjectsUpdated();
      
      // Show success message with archived experiment count
      if (data.archivedExperimentCount > 0) {
        alert(`Project archived successfully along with ${data.archivedExperimentCount} experiment(s)`);
      }
    } catch (error) {
      console.error('Failed to archive project:', error);
      alert('Failed to archive project');
    }
  };

  const handleUnarchiveProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to restore this project?\n\nThis will make the project visible again, but experiments will remain archived unless restored individually.')) {
      return;
    }

    try {
      await apiPost(`/projects/${projectId}/unarchive`);
      await fetchProjects();
      onProjectsUpdated();
      alert('Project restored successfully');
    } catch (error) {
      console.error('Failed to restore project:', error);
      alert('Failed to restore project');
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
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-primary" onClick={startCreatingProject}>
                  <FeatherIcon icon="plus" size={16} />
                  New Project
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowArchived(!showArchived)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <FeatherIcon icon={showArchived ? "eye-off" : "archive"} size={16} />
                  {showArchived ? 'Hide Archived' : 'View Archived'}
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="empty-state">
                  <p>{showArchived ? 'No archived projects' : 'No projects yet'}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                    {showArchived 
                      ? 'Archived projects will appear here'
                      : 'Create your first project to organize your experiments'
                    }
                  </p>
                </div>
              ) : (
                <div className="projects-list">
                  {projects.map((project) => {
                    const isArchived = project.archived;
                    return (
                      <div 
                        key={project.project_id} 
                        className="project-card"
                        style={isArchived ? { 
                          opacity: 0.7, 
                          borderLeft: '3px solid var(--warning)',
                          background: '#fafafa'
                        } : {}}
                      >
                        <div className="project-info">
                          <h3>
                            {project.name}
                            {isArchived && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontSize: '0.75rem', 
                                color: 'var(--warning)',
                                fontWeight: 'normal',
                                padding: '2px 8px',
                                background: '#fff3cd',
                                borderRadius: '4px'
                              }}>
                                Archived
                              </span>
                            )}
                          </h3>
                          {project.url && (
                            <p className="project-url">{project.url}</p>
                          )}
                          {project.description && (
                            <p className="project-description">{project.description}</p>
                          )}
                        </div>
                        <div className="project-actions">
                          {!isArchived && (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setEditingProject(project)}
                              >
                                <FeatherIcon icon="edit" size={14} />
                                Edit
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleArchiveProject(project.project_id)}
                                style={{ color: 'var(--warning)' }}
                                title="Archive project and all its experiments"
                              >
                                <FeatherIcon icon="archive" size={14} />
                                Archive
                              </button>
                            </>
                          )}
                          {isArchived && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleUnarchiveProject(project.project_id)}
                              title="Restore this project"
                            >
                              <FeatherIcon icon="rotate-ccw" size={14} />
                              Restore
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
