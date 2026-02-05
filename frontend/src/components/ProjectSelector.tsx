import { useState, useEffect } from 'react';
import { Project } from '../types';
import FeatherIcon from 'feather-icons-react';
import { API_URL } from '../config';

interface ProjectSelectorProps {
  apiKey: string;
  selectedProjectId: string | null;
  onProjectChange: (projectId: string | null) => void;
  onManageProjects: () => void;
}

export default function ProjectSelector({ 
  apiKey, 
  selectedProjectId, 
  onProjectChange,
  onManageProjects 
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [apiKey]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/projects?apiKey=${apiKey}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
        
        // Auto-select first project if none selected
        if (!selectedProjectId && data.projects.length > 0) {
          onProjectChange(data.projects[0].project_id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find(p => p.project_id === selectedProjectId);

  const handleSelect = (projectId: string | null) => {
    onProjectChange(projectId);
    setIsOpen(false);
  };

  return (
    <div className="project-selector-container">
      <div className="project-selector-label">Project</div>
      <div className="project-selector-wrapper">
        <button 
          className="project-selector-button"
          onClick={() => setIsOpen(!isOpen)}
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
            <div className="dropdown-overlay" onClick={() => setIsOpen(false)} />
            <div className="project-dropdown">
              <div className="project-dropdown-header">
                <span>Select Project</span>
                <button 
                  className="dropdown-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onManageProjects();
                  }}
                >
                  <FeatherIcon icon="settings" size={14} />
                  Manage
                </button>
              </div>
              
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
                    {selectedProjectId === project.project_id && (
                      <FeatherIcon icon="check" size={16} className="check-icon" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

