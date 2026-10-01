// Unambiguous alphabet avoiding 0, O, 1, I to prevent confusion when sharing/typing
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generates a random 5-character string from unambiguous alphanumeric characters.
 */
export function generateRandomCode(length = 5): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    result += ALPHABET[randomIndex];
  }
  return result;
}

/**
 * Generates a full room code with WK- prefix (e.g. WK-7F29Q).
 */
export function generateRoomCode(): string {
  return `WK-${generateRandomCode(5)}`;
}

/**
 * Normalizes user-typed room code by uppercase, trimming, and adding WK- prefix if missing.
 */
export function normalizeRoomCode(input: string): string {
  let cleaned = input.trim().toUpperCase();
  if (!cleaned.startsWith('WK-') && cleaned.length === 5) {
    cleaned = `WK-${cleaned}`;
  }
  return cleaned;
}
