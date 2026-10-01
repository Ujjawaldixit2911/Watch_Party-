import crypto from 'crypto';

/**
 * Generates an opaque, cryptographically secure session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a SHA-256 hash of a session token for secure DB storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
