import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Project } from '../types';
import FeatherIcon from 'feather-icons-react';
import { apiGet, apiPost, apiDelete } from '../utils/api';

export default function ProjectSelector() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Derive selectedProjectId from the URL
  const projectMatch = location.pathname.match(/^\/projects\/(.+)/);
  const selectedProjectId = projectMatch ? projectMatch[1] : null;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (isCreating && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isCreating]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/projects');
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setSaving(true);
    try {
      const project = {
        project_id: `project-${Date.now()}`,
        name: newProjectName.trim(),
        url: newProjectUrl.trim() || null,
      };

      await apiPost('/projects', { project });
      await fetchProjects();
      navigate(`/projects/${project.project_id}`);
      setNewProjectName('');
      setNewProjectUrl('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!window.confirm('Archive this project and all its experiments?')) return;

    try {
      await apiDelete(`/projects/${projectId}`);
      await fetchProjects();
      // If the archived project was selected, go to dashboard
      if (selectedProjectId === projectId) {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to archive project:', error);
    }
  };

  const selectedProject = projects.find(p => p.project_id === selectedProjectId);

  const handleSelect = (projectId: string | null) => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate('/');
    }
    setIsOpen(false);
    setIsCreating(false);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setIsCreating(false);
    setNewProjectName('');
    setNewProjectUrl('');
  };

  return (
    <div className="project-selector-container">
      <div className="project-selector-label">Project</div>
      <div className="project-selector-wrapper">
        <button 
          className="project-selector-button"
          onClick={() => isOpen ? closeDropdown() : setIsOpen(true)}
          disabled={loading}
        >
          <div className="project-selector-current">
            <div className="project-icon">
              <FeatherIcon icon="folder" size={18} />
            </div>
            <div className="project-info">
              <div className="project-name">
                {loading ? 'Loading...' : selectedProject ? selectedProject.name : 'All Projects'}
              </div>
              {selectedProject?.url && (
                <div className="project-url-hint">
                  {(() => {
                    try {
                      return new URL(selectedProject.url).hostname;
                    } catch {
                      return selectedProject.url;
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
          <FeatherIcon icon="chevron-down" size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="dropdown-overlay" onClick={closeDropdown} />
            <div className="project-dropdown">
              <div className="project-dropdown-header">
                <span>Projects</span>
                <button 
                  className="dropdown-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreating(!isCreating);
                  }}
                >
                  <FeatherIcon icon="plus" size={14} />
                  New
                </button>
              </div>

              {isCreating && (
                <form onSubmit={handleCreateProject} className="dropdown-create-form">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name"
                    className="dropdown-input"
                    disabled={saving}
                  />
                  <input
                    type="url"
                    value={newProjectUrl}
                    onChange={(e) => setNewProjectUrl(e.target.value)}
                    placeholder="https://example.com (optional)"
                    className="dropdown-input"
                    disabled={saving}
                  />
                  <div className="dropdown-form-actions">
                    <button 
                      type="button" 
                      className="dropdown-cancel-btn"
                      onClick={() => {
                        setIsCreating(false);
                        setNewProjectName('');
                        setNewProjectUrl('');
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="dropdown-save-btn"
                      disabled={!newProjectName.trim() || saving}
                    >
                      {saving ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              )}
              
              <div className="project-dropdown-list">
                <div 
                  className={`project-dropdown-item ${!selectedProjectId ? 'active' : ''}`}
                  onClick={() => handleSelect(null)}
                >
                  <div className="project-item-icon">
                    <FeatherIcon icon="grid" size={16} />
                  </div>
                  <div className="project-item-info">
                    <div className="project-item-name">All Projects</div>
                    <div className="project-item-meta">View all experiments</div>
                  </div>
                  {!selectedProjectId && (
                    <FeatherIcon icon="check" size={16} className="check-icon" />
                  )}
                </div>

                <div className="dropdown-divider" />

                {projects.map((project) => (
                  <div 
                    key={project.project_id}
                    className={`project-dropdown-item ${selectedProjectId === project.project_id ? 'active' : ''}`}
                    onClick={() => handleSelect(project.project_id)}
                  >
                    <div className="project-item-icon">
                      <FeatherIcon icon="folder" size={16} />
                    </div>
                    <div className="project-item-info">
                      <div className="project-item-name">{project.name}</div>
                      {project.url && (
                        <div className="project-item-meta">
                          {(() => {
                            try {
                              return new URL(project.url).hostname;
                            } catch {
                              return project.url;
                            }
                          })()}
                        </div>
                      )}
                    </div>
                    {selectedProjectId === project.project_id ? (
                      <FeatherIcon icon="check" size={16} className="check-icon" />
                    ) : (
                      <button
                        className="project-archive-btn"
                        onClick={(e) => handleArchiveProject(e, project.project_id)}
                        title="Archive project"
                      >
                        <FeatherIcon icon="archive" size={14} />
                      </button>
                    )}
                  </div>
                ))}

                {projects.length === 0 && !loading && (
                  <div className="dropdown-empty">
                    No projects yet
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
