// API URL - automatically switches between dev and production
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API_URL = isDev 
  ? 'http://localhost:3000'
  : 'https://cc719qqgq0.execute-api.us-east-1.amazonaws.com';
