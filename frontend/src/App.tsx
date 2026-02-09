import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import ExperimentsPage from './pages/ExperimentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import VisualSelectorPage from './pages/VisualSelectorPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import ProjectSelector from './components/ProjectSelector';
import FeatherIcon from 'feather-icons-react';
import { getToken } from './utils/auth';
import './App.css';

function Navigation() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-left logo-link">
          <h1>Simple A/B Testing</h1>
          <p>Build and test your experiments</p>
        </Link>
        <div className="header-right desktop-only">
          <ProjectSelector />
          <Link to="/settings" className="settings-link" title="Settings">
            <FeatherIcon icon="settings" size={20} />
          </Link>
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
            <ProjectSelector />
            <Link 
              to="/settings" 
              className="mobile-menu-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <FeatherIcon icon="settings" size={18} />
              Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function AppContent() {
  const location = useLocation();
  // Initialize token directly from localStorage so the first render has the correct value
  const [token, setTokenState] = useState<string | null>(() => getToken());

  // Re-check token when navigating (e.g. after login redirect)
  useEffect(() => {
    setTokenState(getToken());
  }, [location.pathname]);

  // Check if we're on auth or visual selector pages
  const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/auth/');
  const isVisualSelectorPage = location.pathname === '/visual-selector';
  const showNavigation = !isAuthPage && !isVisualSelectorPage;

  // Redirect to auth if no JWT token (except for auth pages)
  if (!token && !isAuthPage) {
    return <Navigate to="/auth" replace />;
  }

  // Auth page needs full viewport without app wrapper
  if (isAuthPage) {
    return <AuthPage />;
  }

  return (
    <div className="app">
      {showNavigation && token && <Navigation />}
      <div className="app-content" style={isVisualSelectorPage ? { height: '100vh' } : undefined}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects/:projectId" element={<ProjectPage />} />
          <Route path="/experiments" element={<ExperimentsPage selectedProjectId={null} />} />
          <Route path="/analytics" element={<AnalyticsPage selectedProjectId={null} />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/visual-selector" element={<VisualSelectorPage />} />
        </Routes>
      </div>
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
