import { CheckRoomResponse, CreateRoomResponse } from '@watchparty/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
