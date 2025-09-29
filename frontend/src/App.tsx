import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ExperimentsPage from './pages/ExperimentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>Simple A/B Testing</h1>
          <p>Build and test your experiments</p>
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

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<ExperimentsPage />} />
            <Route path="/experiments" element={<ExperimentsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
