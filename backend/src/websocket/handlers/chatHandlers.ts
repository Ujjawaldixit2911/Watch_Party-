import { Server, Socket } from 'socket.io';
import crypto from 'crypto';
import {
  ChatMessage,
  ClientToServerEvents,
  SendMessageEventSchema,
  ServerToClientEvents,
} from '@watchparty/shared';
import { RoomManager } from '../../services/RoomManager';
import { socketRateLimiter } from '../../services/RateLimiter';
import { cleanText, sanitizeHtml } from '../../utils/sanitize';

export function registerChatHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager
): void {
  socket.on('send_message', (rawPayload) => {
    try {
      if (!socketRateLimiter.check(`${socket.id}:chat`, 5, 5000)) {
        socket.emit('error', {
          code: 'RATE_LIMITED',
          message: 'You are sending messages too quickly. Please wait a moment.',
        });
        return;
      }

      const parseResult = SendMessageEventSchema.safeParse(rawPayload);
      if (!parseResult.success) {
        socket.emit('error', {
          code: 'INVALID_PAYLOAD',
          message: parseResult.error.errors[0]?.message || 'Invalid chat message.',
        });
        return;
      }

      const resolved = roomManager.findRoomBySocket(socket.id);
      if (!resolved) {
        socket.emit('error', { code: 'NOT_IN_ROOM', message: 'You are not in an active room.' });
        return;
      }

      const { room, participant } = resolved;
      const sanitizedContent = sanitizeHtml(cleanText(parseResult.data.content));

      if (sanitizedContent.length === 0) {
        return;
      }

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        userId: participant.userId,
        username: participant.username,
        role: participant.role,
        content: sanitizedContent,
        timestamp: Date.now(),
        isSystem: false,
      };

      room.addChatMessage(message);
      io.to(room.roomCode).emit('message_received', message);
    } catch (error) {
      console.error('[Socket:send_message] error:', error);
    }
  });
}
