// Environment-based configuration
// In production, these use custom domains. In development, they use localhost.

const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// API endpoint for backend calls
export const API_URL = isDev 
  ? 'http://localhost:3000'
  : 'https://api.simpleabtesting.com';

// SDK URL - loads from CDN in production
export const SDK_URL = isDev
  ? 'http://localhost:3000/sdk.js'
  : 'https://sdk.simpleabtesting.com/simple-ab-testing.umd.js';
