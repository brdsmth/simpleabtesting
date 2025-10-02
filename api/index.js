const express = require('express');
const cors = require('cors');

// Import database configuration
const { testConnection, initializeDatabase } = require('./config/database');

// Import routers
const experimentsRouter = require('./routes/experiments');
const demoRouter = require('./routes/demo');
const sdkRouter = require('./routes/sdk');
const analyticsRouter = require('./routes/analytics');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/experiments', experimentsRouter);
app.use('/demo', demoRouter);
app.use('/analytics', analyticsRouter);
app.use('/', sdkRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to the Simple A/B Testing API",
    version: "1.0.0",
    endpoints: {
      experiments: {
        "GET /experiments?apiKey={key}": "Fetch experiments by API key",
        "POST /experiments": "Save/update an experiment"
      },
      analytics: {
        "POST /analytics/track": "Track an analytics event",
        "GET /analytics?apiKey={key}": "Get analytics events",
        "GET /analytics/summary?apiKey={key}": "Get analytics summary"
      },
      demo: {
        "POST /demo/store-experiment": "Store temporary experiment for demo"
      },
      sdk: {
        "GET /sdk.js": "Download the SDK JavaScript file"
      }
    }
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

    // Start the server
    app.listen(port, () => {
      console.log(`API server listening at http://localhost:${port}`);
      console.log(`Available endpoints:`);
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
