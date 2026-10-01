import crypto from 'crypto';

/**
 * Escapes HTML characters in string to prevent injection in any plain text renderers.
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Trims and collapses internal extra whitespace.
 */
export function cleanText(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}
