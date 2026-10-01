import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '@watchparty/shared';
import { RoomManager } from '../services/RoomManager';
import { registerRoomHandlers } from './handlers/roomHandlers';
import { registerPlaybackHandlers } from './handlers/playbackHandlers';
import { registerRoleHandlers } from './handlers/roleHandlers';
import { registerRequestHandlers } from './handlers/requestHandlers';
import { registerChatHandlers } from './handlers/chatHandlers';

export function setupWebSocket(
  httpServer: HttpServer,
  roomManager: RoomManager,
  clientUrl: string
): Server<ClientToServerEvents, ServerToClientEvents> {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: clientUrl === '*' ? '*' : [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    maxHttpBufferSize: 1e4, // 10 KB security limit
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    // Register event modules
    registerRoomHandlers(io, socket, roomManager);
    registerPlaybackHandlers(io, socket, roomManager);
    registerRoleHandlers(io, socket, roomManager);
    registerRequestHandlers(io, socket, roomManager);
    registerChatHandlers(io, socket, roomManager);

    // Socket disconnection with grace period
    socket.on('disconnect', () => {
      const resolved = roomManager.handleSocketDisconnect(socket.id);
      if (resolved) {
        const { room, participant } = resolved;
        // Broadcast participant left / disconnected after a short debounce to avoid flicker on quick reload
        setTimeout(() => {
          // If still disconnected after 3 seconds, inform room
          if (!participant.isConnected && room.status === 'ACTIVE') {
            io.to(room.roomCode).emit('participant_left', {
              userId: participant.userId,
              username: participant.username,
            });
          }
        }, 3000);
      }
    });
  });

  // Background room cleanup: check every 5 minutes
  setInterval(() => {
    roomManager.cleanupInactiveRooms().catch((err) => {
      console.error('[WebSocket] Inactive room cleanup error:', err);
    });
  }, 5 * 60 * 1000);

  return io;
}
