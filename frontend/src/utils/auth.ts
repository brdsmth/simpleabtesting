/**
 * Get the stored JWT token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('simple_ab_testing_token');
}

/**
 * Check if user is authenticated (has JWT token)
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Save JWT token to localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem('simple_ab_testing_token', token);
}

/**
 * Remove JWT token from localStorage (logout)
 */
export function clearToken(): void {
  localStorage.removeItem('simple_ab_testing_token');
}

/**
 * Get the stored API key from localStorage (for SDK usage)
 */
export function getApiKey(): string | null {
  return localStorage.getItem('simple_ab_testing_api_key');
}

/**
 * Save API key to localStorage (for SDK usage)
 */
export function setApiKey(apiKey: string): void {
  localStorage.setItem('simple_ab_testing_api_key', apiKey);
}
