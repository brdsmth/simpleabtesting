import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ExperimentsPage from './pages/ExperimentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
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
  const location = useLocation();
  
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>Simple A/B Testing</h1>
          <p>Build and test your experiments</p>
        </div>
        <div className="header-center">
          <ProjectSelector
            apiKey={API_KEY}
            selectedProjectId={selectedProjectId}
            onProjectChange={onProjectChange}
            onManageProjects={onManageProjects}
          />
        </div>
        <div className="header-nav">
          <Link 
            to="/experiments" 
            className={`tab-btn ${location.pathname === '/experiments' || location.pathname === '/' ? 'active' : ''}`}
          >
            Experiments
          </Link>
          <Link 
            to="/analytics" 
            className={`tab-btn ${location.pathname === '/analytics' ? 'active' : ''}`}
          >
            Analytics
          </Link>
        </div>
      </div>
    </header>
  );
}

function AppContent() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectManager, setShowProjectManager] = useState(false);

  const handleProjectsUpdated = () => {
    // Force re-fetch of projects by toggling the key
    setSelectedProjectId(null);
  };

  return (
    <div className="app">
      <Navigation 
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        onManageProjects={() => setShowProjectManager(true)}
      />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<ExperimentsPage selectedProjectId={selectedProjectId} />} />
          <Route path="/experiments" element={<ExperimentsPage selectedProjectId={selectedProjectId} />} />
          <Route path="/analytics" element={<AnalyticsPage selectedProjectId={selectedProjectId} />} />
        </Routes>
      </div>
      
      {showProjectManager && (
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
