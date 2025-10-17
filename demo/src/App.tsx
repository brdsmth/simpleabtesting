import { useEffect, useState } from 'react';

declare global {
  interface Window {
    SimpleABTesting: any;
  }
}

function App() {
  const [sdkData, setSdkData] = useState<any>(null);
  const [currentApiKey, setCurrentApiKey] = useState<string>('demo-api-key-123');
  const [currentExperimentId, setCurrentExperimentId] = useState<string>('exp-1758898330832');

  const clearAssignments = () => {
    localStorage.removeItem('simple_ab_assignments');
    window.location.reload();
  };

  const clearEvents = () => {
    localStorage.removeItem('simple_ab_events');
    window.location.reload();
  };

  const clearVisitorId = () => {
    window.SimpleABTesting.reset();
    window.location.reload();
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'http://localhost:3000/sdk.js';
    script.onload = () => {
      // Get API key from URL parameters or use default
      const urlParams = new URLSearchParams(window.location.search);
      const apiKey = urlParams.get('apiKey') || 'demo-api-key-123';
      
      setCurrentApiKey(apiKey);
      console.log('Demo using API key:', apiKey);
      
      // New simplified API key-based initialization
      window.SimpleABTesting.init({
        apiKey: apiKey,
        debug: true
      }).then(() => {
        // After initialization, fetch experiments to get the correct experiment ID
        fetch(`http://localhost:3000/experiments?apiKey=${encodeURIComponent(apiKey)}`)
          .then(response => response.json())
          .then(data => {
            if (data.experiments && data.experiments.length > 0) {
              setCurrentExperimentId(data.experiments[0].id);
              console.log('Using experiment ID:', data.experiments[0].id);
            }
          })
          .catch(error => {
            console.error('Failed to fetch experiment ID:', error);
          });
      });
      
      const updateData = () => {
        setSdkData({
          visitorId: localStorage.getItem('simple_ab_visitor_id'),
          assignments: JSON.parse(localStorage.getItem('simple_ab_assignments') || '{}'),
          events: window.SimpleABTesting.getEvents()
        });
      };
      
      updateData();
      setInterval(updateData, 1000);
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <style>
        {`
          body {
            margin: 0;
            background: #f8f9fa;
          }
          
          /* Hero Section */
          .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 20px;
            text-align: center;
          }
          
          .hero-media {
            max-width: 600px;
            margin: 30px auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          
          .hero-image {
            width: 100%;
            height: auto;
            display: block;
          }
          
          /* CTA Button - matches template selector */
          .cta-button {
            background-color: #007bff;
            border: 1px solid #007bff;
            color: white;
            padding: 16px 32px;
            font-size: 18px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            margin: 20px 0;
            transition: all 0.2s ease;
          }
          .cta-button:hover {
            background-color: #0056b3;
            border-color: #0056b3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,123,255,0.3);
          }
          
          /* Content Section */
          .content-section {
            background: white;
            padding: 40px 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          /* Pricing Section */
          .pricing-section {
            text-align: center;
            padding: 60px 20px;
          }
          
          .pricing-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 40px;
            max-width: 400px;
            margin: 0 auto;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          }
          
          .pricing-amount {
            font-size: 48px;
            font-weight: bold;
            color: #667eea;
            margin: 20px 0;
          }
          
          /* Form Section */
          .form-section {
            background: white;
            padding: 40px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .checkout-form {
            max-width: 500px;
            margin: 0 auto;
          }
          
          .form-field {
            margin-bottom: 20px;
          }
          
          .form-field label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
          }
          
          .form-field input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
          }
          
          .optional-field {
            opacity: 0.7;
          }
          
          .optional-field label::after {
            content: ' (optional)';
            color: #888;
            font-size: 14px;
          }
          
          /* Debug Panel */
          .debug-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 15px;
            max-width: 300px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 1000;
          }
          
          .debug-panel h4 {
            margin: 0 0 10px 0;
            color: #667eea;
            font-size: 14px;
          }
          
          .debug-controls button {
            padding: 8px 12px;
            margin: 5px 5px 5px 0;
            font-size: 12px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
          }
          
          .debug-controls button:hover {
            background: #f0f0f0;
          }
          
          .sdk-info {
            font-size: 11px;
            color: #666;
            margin-top: 10px;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 4px;
            max-height: 150px;
            overflow-y: auto;
          }
        `}
      </style>

      {/* Hero Section */}
      <div className="hero-section">
        <h1>Transform Your Business with Our Platform</h1>
        <p style={{ fontSize: '20px', margin: '20px 0', opacity: 0.95 }}>
          The all-in-one solution for modern teams
        </p>
        
        <div className="hero-media">
          <img 
            className="hero-image" 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop" 
            alt="Hero"
          />
        </div>
        
        <button 
          onClick={() => window.SimpleABTesting?.track(currentExperimentId, 'conversion')} 
          className="cta-button"
        >
          Start Free Trial
        </button>
      </div>

      {/* Features Section */}
      <div className="content-section">
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Why Choose Us?</h2>
        <p style={{ textAlign: 'center', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
          Join thousands of companies who trust our platform to grow their business and delight their customers.
        </p>
      </div>

      {/* Pricing Section */}
      <div className="pricing-section">
        <h2>Simple, Transparent Pricing</h2>
        <div className="pricing-card">
          <h3>Professional Plan</h3>
          <div className="pricing-amount">$49/month</div>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Everything you need to grow
          </p>
          <button className="cta-button">Get Started</button>
        </div>
      </div>

      {/* Checkout Form Section */}
      <div className="form-section">
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Start Your Free Trial</h2>
        <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-field">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" required />
          </div>
          
          <div className="form-field">
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" required />
          </div>
          
          <div className="form-field optional-field">
            <label>Company Name</label>
            <input type="text" placeholder="Acme Inc." />
          </div>
          
          <div className="form-field optional-field">
            <label>Phone Number</label>
            <input type="tel" placeholder="+1 (555) 123-4567" />
          </div>
          
          <button type="submit" className="cta-button" style={{ width: '100%' }}>
            Start Free Trial
          </button>
        </form>
      </div>

      {/* Debug Panel */}
      <div className="debug-panel">
        <h4>A/B Testing Debug</h4>
        
        {/* Current Variant Display */}
        {sdkData?.assignments?.[currentExperimentId] && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '4px' }}>ACTIVE VARIANT</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {sdkData.assignments[currentExperimentId]}
            </div>
          </div>
        )}
        
        <div style={{ fontSize: '11px', marginBottom: '10px' }}>
          <strong>API Key:</strong> <code style={{ fontSize: '10px' }}>{currentApiKey}</code><br/>
          <strong>Experiment:</strong> <code style={{ fontSize: '10px' }}>{currentExperimentId}</code>
        </div>
        <div className="debug-controls">
          <button onClick={clearAssignments}>Clear Assignments</button>
          <button onClick={clearEvents}>Clear Events</button>
          <button onClick={clearVisitorId}>Reset Visitor</button>
        </div>
        <div className="sdk-info">
          <pre style={{ margin: 0, fontSize: '10px', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(sdkData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;