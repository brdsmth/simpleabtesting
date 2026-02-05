import app, { initializeApp } from './app.js';

const port = 3000;

// Initialize database and start server for local development
const startServer = async () => {
  try {
    const initialized = await initializeApp();
    if (!initialized) {
      console.error('Failed to initialize database. Server will not start.');
      process.exit(1);
    }

    app.listen(port, () => {
      console.log(`API server listening at http://localhost:${port}`);
      console.log(`Available endpoints:`);
      console.log(`  - GET  /projects?apiKey={key}`);
      console.log(`  - GET  /experiments?apiKey={key}`);
      console.log(`  - POST /experiments`);
      console.log(`  - POST /analytics/track`);
      console.log(`  - GET  /analytics?apiKey={key}`);
      console.log(`  - GET  /analytics/summary?apiKey={key}`);
      console.log(`  - POST /demo/store-experiment`);
      console.log(`  - GET  /sdk.js`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
