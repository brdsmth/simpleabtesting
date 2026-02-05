import express from 'express';
import cors from 'cors';
import { testConnection, initializeDatabase } from './config/database.js';
import experimentsRouter from './routes/experiments.js';
import demoRouter from './routes/demo.js';
import sdkRouter from './routes/sdk.js';
import analyticsRouter from './routes/analytics.js';
import projectsRouter from './routes/projects.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/projects', projectsRouter);
app.use('/experiments', experimentsRouter);
app.use('/demo', demoRouter);
app.use('/analytics', analyticsRouter);
app.use('/', sdkRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to the Simple A/B Testing API",
    version: "1.1.0",
    endpoints: {
      projects: {
        "GET /projects?apiKey={key}": "Fetch all projects by API key",
        "GET /projects/{projectId}?apiKey={key}": "Fetch a specific project",
        "POST /projects": "Create/update a project",
        "DELETE /projects/{projectId}?apiKey={key}": "Delete a project"
      },
      experiments: {
        "GET /experiments?apiKey={key}&projectId={id}": "Fetch experiments by API key (optional: filter by projectId)",
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

// Database initialization flag to ensure it only runs once
let dbInitialized = false;

// Initialize database (called before first request in Lambda)
export const initializeApp = async () => {
  if (dbInitialized) return true;
  
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database');
      return false;
    }
    
    await initializeDatabase();
    dbInitialized = true;
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize app:', error.message);
    return false;
  }
};

export default app;
