import serverless from 'serverless-http';
import app, { initializeApp } from './app.js';

// Initialize database connection once on cold start
let initialized = false;

export const handler = async (event, context) => {
  // Initialize database on first invocation (Lambda cold start)
  if (!initialized) {
    console.log('Cold start - initializing database connection');
    await initializeApp();
    initialized = true;
  }

  // Use serverless-http to handle the request
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};
