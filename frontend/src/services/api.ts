import { CheckRoomResponse, CreateRoomResponse } from '@watchparty/shared';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

export async function createRoomApi(
  username: string,
  roomName?: string
): Promise<CreateRoomResponse> {
  const response = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, roomName: roomName || undefined }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to create room');
  }

  return data;
}

export async function checkRoomApi(roomCode: string): Promise<CheckRoomResponse> {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${encodeURIComponent(roomCode)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to check room');
  }
  return data;
}

// ===================== User Auth REST API =====================

export async function registerApi(name: string, email: string, password?: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Registration failed');
  }
  return data.user;
}

export async function loginApi(email: string, password?: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Login failed');
  }
  return data.user;
}

export async function googleLoginApi(userData: {
  name: string;
  email: string;
  avatar?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Google login failed');
  }
  return data.user;
}

export async function updateProfileApi(updates: {
  userId: string;
  name?: string;
  bio?: string;
  favoriteGenre?: string;
  avatar?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to update profile');
  }
  return data.user;
}

export async function addCreatedRoomApi(userId: string, code: string, name?: string) {
  await fetch(`${API_BASE_URL}/api/auth/rooms/created`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, code, name }),
  }).catch(() => {});
}

export async function addJoinedRoomApi(userId: string, code: string, name?: string, hostName?: string) {
  await fetch(`${API_BASE_URL}/api/auth/rooms/joined`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, code, name, hostName }),
  }).catch(() => {});
}

export async function removeCreatedRoomApi(userId: string, code: string) {
  await fetch(`${API_BASE_URL}/api/auth/rooms/created/${encodeURIComponent(userId)}/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  }).catch(() => {});
}

export async function removeJoinedRoomApi(userId: string, code: string) {
  await fetch(`${API_BASE_URL}/api/auth/rooms/joined/${encodeURIComponent(userId)}/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  }).catch(() => {});
}

export async function clearJoinedHistoryApi(userId: string) {
  await fetch(`${API_BASE_URL}/api/auth/rooms/joined-all/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  }).catch(() => {});
}
