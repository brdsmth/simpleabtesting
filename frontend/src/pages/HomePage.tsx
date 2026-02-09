import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Experiment, Project } from '../types';
import WelcomeModal from '../components/WelcomeModal';
import FeatherIcon from 'feather-icons-react';
import { apiGet, apiPost } from '../utils/api';
import './HomePage.css';

function hasSeenWelcome(): boolean {
  return localStorage.getItem('simple_ab_testing_welcome_seen') === 'true';
}

export default function HomePage() {
  const navigate = useNavigate();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectsData, experimentsData] = await Promise.all([
        apiGet('/projects'),
        apiGet('/experiments'),
      ]);
      setProjects(projectsData.projects || []);
      setExperiments(experimentsData.experiments || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (showNewProject && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showNewProject]);

  // Compute per-project experiment metrics
  const getProjectMetrics = (projectId: string) => {
    const projectExperiments = experiments.filter(e => e.project_id === projectId);
    const active = projectExperiments.filter(e => e.status === 'active').length;
    const paused = projectExperiments.filter(e => e.status === 'paused').length;
    return {
      total: projectExperiments.length,
      active,
      paused,
    };
  };

  const handleNewProject = () => {
    setShowNewProject(true);
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
      setNewProjectName('');
      setNewProjectUrl('');
      setShowNewProject(false);
      navigate(`/projects/${project.project_id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGetStarted = () => {
    if (hasSeenWelcome()) {
      setShowNewProject(true);
    } else {
      setShowWelcomeModal(true);
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-content">
          <div className="loading-state">Loading projects...</div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="home-page">
        <div className="home-content">
          <div className="empty-state-home">
            <div className="empty-state-icon-home">No projects yet</div>
            <h2>Ready to start testing?</h2>
            <p>Create a project to organize your A/B tests. Use the project dropdown in the header to get started.</p>
            <button 
              className="btn btn-primary btn-large"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>

        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-content">
        <div className="home-header">
          <div>
            <h1 className="home-title">Dashboard</h1>
            <p className="home-subtitle">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} -- {experiments.length} {experiments.length === 1 ? 'experiment' : 'experiments'} total
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleNewProject}
          >
            <FeatherIcon icon="plus" size={16} />
            New Project
          </button>
        </div>

        <div className="projects-grid">
          {projects.map((project) => {
            const metrics = getProjectMetrics(project.project_id);
            let hostname = '';
            if (project.url) {
              try { hostname = new URL(project.url).hostname; } catch { hostname = project.url; }
            }

            return (
              <div 
                key={project.project_id} 
                className="project-card"
                onClick={() => navigate(`/projects/${project.project_id}`)}
              >
                <div className="project-card-header">
                  <div className="project-card-icon">
                    <FeatherIcon icon="folder" size={20} />
                  </div>
                  <div className="project-card-title-area">
                    <h3 className="project-card-title">{project.name}</h3>
                    {hostname && (
                      <span className="project-card-url">{hostname}</span>
                    )}
                  </div>
                  <FeatherIcon icon="chevron-right" size={18} className="project-card-arrow" />
                </div>

                <div className="project-card-body">
                  <div className="project-card-stat">
                    <div className="project-card-stat-value">{metrics.total}</div>
                    <div className="project-card-stat-label">
                      {metrics.total === 1 ? 'Experiment' : 'Experiments'}
                    </div>
                  </div>
                  <div className="project-card-stat">
                    <div className="project-card-stat-value project-card-stat-active">{metrics.active}</div>
                    <div className="project-card-stat-label">Active</div>
                  </div>
                  <div className="project-card-stat">
                    <div className="project-card-stat-value project-card-stat-paused">{metrics.paused}</div>
                    <div className="project-card-stat-label">Paused</div>
                  </div>
                </div>

                {project.description && (
                  <div className="project-card-description">{project.description}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />

      {showNewProject && (
        <div className="new-project-overlay" onClick={() => setShowNewProject(false)}>
          <div className="new-project-modal" onClick={(e) => e.stopPropagation()}>
            <div className="new-project-modal-header">
              <h3>New Project</h3>
              <button className="new-project-close" onClick={() => setShowNewProject(false)}>
                <FeatherIcon icon="x" size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="new-project-form">
              <div className="form-group">
                <label htmlFor="project-name">Project Name</label>
                <input
                  ref={nameInputRef}
                  id="project-name"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Website"
                  disabled={saving}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="project-url">Website URL (optional)</label>
                <input
                  id="project-url"
                  type="url"
                  value={newProjectUrl}
                  onChange={(e) => setNewProjectUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={saving}
                />
              </div>
              <div className="new-project-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowNewProject(false);
                    setNewProjectName('');
                    setNewProjectUrl('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!newProjectName.trim() || saving}
                >
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
