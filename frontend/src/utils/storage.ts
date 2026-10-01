export interface UserSession {
  roomCode: string;
  userId: string;
  sessionToken: string;
  username: string;
}

const STORAGE_PREFIX = 'wp_session_';

export function saveSession(session: UserSession): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${session.roomCode}`, JSON.stringify(session));
    localStorage.setItem('wp_last_room', session.roomCode);
  } catch (err) {
    console.error('Failed to save session to localStorage:', err);
  }
}

export function getSession(roomCode: string): UserSession | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${roomCode}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession(roomCode: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${roomCode}`);
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}
