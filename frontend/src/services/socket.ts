import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@watchparty/shared';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const socket: TypedSocket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'], // Prioritize websocket with polling fallback
});
