import crypto from 'crypto';

/**
 * Generate a unique API key
 * Format: sab_live_xxxxxxxxxxxxxxxxxxxx (like Stripe)
 */
export function generateApiKey() {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `sab_live_${randomBytes}`;
}

/**
 * Generate a magic link token for email verification
 */
export function generateMagicToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
