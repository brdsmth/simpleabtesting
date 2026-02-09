import { useState, useEffect } from 'react';
import { getApiKey, clearToken } from '../utils/auth';
import { apiGet } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import './SettingsPage.css';

interface User {
  id: number;
  email: string;
  created_at: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedScript, setCopiedScript] = useState(false);
  const navigate = useNavigate();
  const apiKey = getApiKey();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await apiGet('/auth/me');
      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      clearToken();
      localStorage.removeItem('simple_ab_testing_api_key'); // Clear API key too
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <FeatherIcon icon="loader" size={32} className="spin" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account and integration</p>
        </div>

        <div className="settings-section">
          <h2>Account Information</h2>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Member Since</span>
            <span className="info-value">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
            </span>
          </div>
        </div>

        <div className="settings-section integration-section">
          <h2>Website Integration</h2>
          <p className="section-description">
            Copy and paste this script tag into your website's HTML, right before the closing <code>&lt;/body&gt;</code> tag:
          </p>
          <div className="script-box">
            <pre><code>{`<script\n  src="https://cdn.simpleabtesting.com/sdk.js"\n  data-api-key="${apiKey}"\n></script>`}</code></pre>
            <button 
              onClick={() => {
                const script = `<script\n  src="https://cdn.simpleabtesting.com/sdk.js"\n  data-api-key="${apiKey}"\n></script>`;
                navigator.clipboard.writeText(script);
                setCopiedScript(true);
                setTimeout(() => setCopiedScript(false), 2000);
              }} 
              className="copy-btn-primary"
              title="Copy script to clipboard"
            >
              <FeatherIcon icon={copiedScript ? "check" : "copy"} size={18} />
              {copiedScript ? 'Copied!' : 'Copy Script'}
            </button>
          </div>
          {copiedScript && (
            <div className="success-message">
              <FeatherIcon icon="check-circle" size={16} />
              Script copied! Paste it into your website's HTML.
            </div>
          )}
          <div className="help-box">
            <FeatherIcon icon="info" size={16} />
            <div>
              <strong>Where to paste?</strong>
              <p>Add this script tag to every page where you want to run A/B tests. It should be placed just before the closing <code>&lt;/body&gt;</code> tag of your HTML.</p>
            </div>
          </div>
        </div>

        <div className="settings-section danger-section">
          <h2>Sign Out</h2>
          <p className="section-description">
            Sign out of your account on this device
          </p>
          <button onClick={handleSignOut} className="btn btn-danger">
            <FeatherIcon icon="log-out" size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
