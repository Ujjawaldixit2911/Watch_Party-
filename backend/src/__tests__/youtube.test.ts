import { describe, it, expect } from 'vitest';
import { extractYouTubeVideoId } from '../utils/youtube';

describe('extractYouTubeVideoId', () => {
  it('extracts ID from standard watch URLs with various query parameters', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s&list=PL123')).toBe(
      'dQw4w9WgXcQ'
    );
  });

  it('extracts ID from short youtu.be URLs', () => {
    expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ?t=10')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from embed, shorts, and live URLs', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('accepts valid 11-character raw video IDs', () => {
    expect(extractYouTubeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('L_LUpnjgPso')).toBe('L_LUpnjgPso');
  });

  it('returns null for invalid strings or non-youtube URLs', () => {
    expect(extractYouTubeVideoId('https://vimeo.com/1234567')).toBeNull();
    expect(extractYouTubeVideoId('not_a_valid_id')).toBeNull();
    expect(extractYouTubeVideoId('')).toBeNull();
  });
});
