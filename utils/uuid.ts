/**
 * Generates a UUID (Universally Unique Identifier)
 * Falls back to a polyfill implementation if crypto.randomUUID is not available
 */
export function generateUUID(): string {
  // Check if native crypto.randomUUID is available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback implementation
  // This is a simplified version of the UUID v4 algorithm
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    // Use Math.random if crypto is not available
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 