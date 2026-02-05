// Environment-based configuration
// In production, these use custom domains. In development, they use localhost.

const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// API endpoint for backend calls
export const API_URL = isDev 
  ? 'http://localhost:3000'
  : 'https://api.simpleabtesting.com';

// Demo app URL (for visual selector iframe)
export const DEMO_URL = isDev
  ? 'http://localhost:8082'
  : 'https://demo.simpleabtesting.com';

// SDK URL (for embedding instructions)
export const SDK_URL = isDev
  ? 'http://localhost:3000/sdk.js'
  : 'https://sdk.simpleabtesting.com/simple-ab-testing.umd.js';
