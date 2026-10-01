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
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const hostname = parsed.hostname.replace(/^www\./, '');

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        const v = parsed.searchParams.get('v');
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
          return v;
        }
      }

      const match = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        return match[1];
      }
    } else if (hostname === 'youtu.be') {
      const match = parsed.pathname.match(/^\/([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch {
    const fallbackRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const fallbackMatch = trimmed.match(fallbackRegex);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1];
    }
  }

  return null;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${paddedMins}:${paddedSecs}`;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
