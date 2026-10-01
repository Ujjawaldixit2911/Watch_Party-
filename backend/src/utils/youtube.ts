/**
 * Extracts a valid 11-character YouTube video ID from various YouTube URL formats or raw ID.
 * Supports:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://www.youtube.com/live/dQw4w9WgXcQ
 * - dQw4w9WgXcQ (raw 11-char ID)
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();

  // If already a raw 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    // Attempt standard URL parse
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const hostname = parsed.hostname.replace(/^www\./, '');

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      // 1. /watch?v=XXXXX
      if (parsed.pathname === '/watch') {
        const v = parsed.searchParams.get('v');
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
          return v;
        }
      }

      // 2. /embed/XXXXX, /shorts/XXXXX, /live/XXXXX, /v/XXXXX
      const match = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        return match[1];
      }
    } else if (hostname === 'youtu.be') {
      // 3. youtu.be/XXXXX
      const match = parsed.pathname.match(/^\/([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch {
    // Fallback regex in case of non-standard URL string
    const fallbackRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const fallbackMatch = trimmed.match(fallbackRegex);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1];
    }
  }

  return null;
}
