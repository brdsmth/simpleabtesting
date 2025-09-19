import { useEffect, useState } from 'react';

declare global {
  interface Window {
    SimpleABTesting: any;
  }
}

function App() {
  const [sdkData, setSdkData] = useState<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'http://localhost:3000/sdk.js';
    script.onload = () => {
      window.SimpleABTesting.init({
        debug: true,
        experiments: [{
          id: 'test',
          name: 'Button Test',
          status: 'active',
          trafficAllocation: 100,
          variations: [
            { id: 'control', name: 'Control', weight: 15, changes: [] },
            { 
              id: 'red', 
              name: 'Red Button', 
              weight: 15, 
              changes: [{ selector: 'button', type: 'style', value: 'background: red; color: white' }]
            },
            { 
              id: 'blue', 
              name: 'Blue Button', 
              weight: 15, 
              changes: [{ selector: 'button', type: 'style', value: 'background: blue; color: white' }]
            },
            { 
              id: 'green', 
              name: 'Green Button', 
              weight: 15, 
              changes: [{ selector: 'button', type: 'style', value: 'background: green; color: white' }]
            },
            { 
              id: 'yellow', 
              name: 'Yellow Button', 
              weight: 15, 
              changes: [{ selector: 'button', type: 'style', value: 'background: yellow; color: black' }]
            },
            { 
              id: 'orange', 
              name: 'Orange Button', 
              weight: 12, 
              changes: [{ selector: 'button', type: 'style', value: 'background: orange; color: white' }]
            },
            { 
              id: 'purple', 
              name: 'Purple Button', 
              weight: 13, 
              changes: [{ selector: 'button', type: 'style', value: 'background: purple; color: white' }]
            }
          ]
        }]
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
      <h1>Simple A/B Testing Demo</h1>
      <button onClick={() => window.SimpleABTesting?.track('test', 'conversion')}>
        Test Button
      </button>
      
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
