/**
 * Generate a random UUID for visitor identification
 */
export function generateVisitorId(): string {
  return 'visitor_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Get or create visitor ID from localStorage
 */
export function getVisitorId(): string {
  const key = 'simple_ab_visitor_id';
  let visitorId = localStorage.getItem(key);
  
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem(key, visitorId);
  }
  
  return visitorId;
}

/**
 * Simple hash function to consistently assign users to variations
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Assign user to a variation based on experiment weights
 */
export function assignVariation(experimentId: string, visitorId: string, variations: any[]): string {
  const hash = hashString(visitorId + experimentId);
  const totalWeight = variations.reduce((sum, v) => sum + v.weight, 0);
  const bucket = hash % totalWeight;
  
  debugLog(`🎲 Assignment calculation:`, {
    visitorId,
    experimentId,
    hash,
    totalWeight,
    bucket,
    variations: variations.map(v => ({ id: v.id, weight: v.weight }))
  });
  
  let currentWeight = 0;
  for (const variation of variations) {
    currentWeight += variation.weight;
    debugLog(`  Checking ${variation.id}: bucket(${bucket}) < currentWeight(${currentWeight})?`);
    if (bucket < currentWeight) {
      debugLog(`  ✅ Selected: ${variation.id}`);
      return variation.id;
    }
  }
  
  // Fallback to first variation
  debugLog(`  ⚠️ Fallback to first variation: ${variations[0]?.id}`);
  return variations[0]?.id || '';
}

/**
 * Log debug messages if debug mode is enabled
 */
export function debugLog(message: string, ...args: any[]): void {
  if ((window as any).SimpleABTesting?.debug) {
    console.log('[SimpleAB]', message, ...args);
  }
}
