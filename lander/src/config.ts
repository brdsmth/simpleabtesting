// Frontend URL - automatically switches between dev and production
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const FRONTEND_URL = isDev 
  ? 'http://localhost:8081'
  : 'https://app.simpleabtesting.com';
