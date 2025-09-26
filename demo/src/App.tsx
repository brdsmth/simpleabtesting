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
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <style>
        {`
          .btn-primary {
            background-color: #007bff;
            border: 1px solid #007bff;
            color: white;
            padding: 12px 24px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
            margin: 10px 0;
          }
          .btn-primary:hover {
            background-color: #0056b3;
            border-color: #0056b3;
          }
        `}
      </style>
      <h1>Simple A/B Testing Demo</h1>
      <p>This demo uses the <strong>API key-based integration</strong>. The experiment configuration is fetched automatically from the API using the key <code>{currentApiKey}</code>.</p>
      <p><strong>Tracking experiment ID:</strong> <code>{currentExperimentId}</code></p>
      
      <button onClick={() => window.SimpleABTesting?.track(currentExperimentId, 'conversion')} className="btn-primary">
        Test Button
      </button>

      <div style={{ marginTop: '20px' }}>
        <button onClick={clearAssignments} style={{ marginRight: '10px' }}>Clear Assignments</button>
        <button onClick={clearEvents} style={{ marginRight: '10px' }}>Clear Events</button>
        <button onClick={clearVisitorId}>Clear Visitor ID (Full Reset)</button>
      </div>
      
      <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h3>SDK Status:</h3>
        <pre style={{ fontSize: '12px' }}>
          {JSON.stringify(sdkData, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;