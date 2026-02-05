import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExperimentsPage from './pages/ExperimentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import VisualSelectorPage from './pages/VisualSelectorPage';
import ProjectSelector from './components/ProjectSelector';
import ProjectManager from './components/ProjectManager';
import './App.css';

const API_KEY = 'demo-api-key-123'; // Consistent API key across the app

interface NavigationProps {
  selectedProjectId: string | null;
  onProjectChange: (projectId: string | null) => void;
  onManageProjects: () => void;
}

function Navigation({ selectedProjectId, onProjectChange, onManageProjects }: NavigationProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-left logo-link">
          <h1>Simple A/B Testing</h1>
          <p>Build and test your experiments</p>
        </Link>
        <div className="header-right desktop-only">
          <ProjectSelector
            apiKey={API_KEY}
            selectedProjectId={selectedProjectId}
            onProjectChange={onProjectChange}
            onManageProjects={onManageProjects}
          />
        </div>
        <button 
          className="hamburger-menu mobile-only"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${showMobileMenu ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${showMobileMenu ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${showMobileMenu ? 'open' : ''}`}></span>
        </button>
      </div>
      
      {showMobileMenu && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <ProjectSelector
              apiKey={API_KEY}
              selectedProjectId={selectedProjectId}
              onProjectChange={(projectId) => {
                onProjectChange(projectId);
                setShowMobileMenu(false);
              }}
              onManageProjects={() => {
                onManageProjects();
                setShowMobileMenu(false);
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
}

function AppContent() {
  const location = useLocation();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectManager, setShowProjectManager] = useState(false);

  const handleProjectsUpdated = () => {
    // Force re-fetch of projects by toggling the key
    setSelectedProjectId(null);
  };

  // Check if we're on the visual selector page
  const isVisualSelectorPage = location.pathname === '/visual-selector';

  return (
    <div className="app">
      {!isVisualSelectorPage && (
        <Navigation 
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          onManageProjects={() => setShowProjectManager(true)}
        />
      )}
      <div className="app-content" style={isVisualSelectorPage ? { height: '100vh' } : undefined}>
        <Routes>
          <Route path="/" element={<HomePage selectedProjectId={selectedProjectId} />} />
          <Route path="/experiments" element={<ExperimentsPage selectedProjectId={selectedProjectId} />} />
          <Route path="/analytics" element={<AnalyticsPage selectedProjectId={selectedProjectId} />} />
          <Route path="/visual-selector" element={<VisualSelectorPage />} />
        </Routes>
      </div>
      
      {!isVisualSelectorPage && showProjectManager && (
        <ProjectManager
          apiKey={API_KEY}
          onClose={() => setShowProjectManager(false)}
          onProjectsUpdated={handleProjectsUpdated}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
