import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  CreateRoomEventSchema,
  JoinRoomEventSchema,
  ServerToClientEvents,
} from '@watchparty/shared';
import { RoomManager } from '../../services/RoomManager';
import { socketRateLimiter } from '../../services/RateLimiter';
import { normalizeRoomCode } from '../../utils/roomCode';

export function registerRoomHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager
): void {
  // CREATE ROOM EVENT
  socket.on('create_room', async (rawPayload, callback) => {
    try {
      if (!socketRateLimiter.check(`${socket.id}:create_room`, 5, 10000)) {
        const err = { code: 'RATE_LIMITED', message: 'Too many create requests. Please wait a moment.' };
        socket.emit('error', err);
        callback?.({ success: false, error: err });
        return;
      }

      const parseResult = CreateRoomEventSchema.safeParse(rawPayload);
      if (!parseResult.success) {
        const err = {
          code: 'INVALID_PAYLOAD',
          message: parseResult.error.errors[0]?.message || 'Invalid room creation payload',
        };
        socket.emit('error', err);
        callback?.({ success: false, error: err });
        return;
      }

      const { username, roomName } = parseResult.data;
      const { room, participant, sessionToken } = await roomManager.createRoom(username, roomName);

      // Join socket to Socket.IO room channel
      socket.join(room.roomCode);
      roomManager.registerSocket(socket.id, room.id, participant.userId);

      const responsePayload = {
        room: {
          id: room.id,
          roomCode: room.roomCode,
          name: room.name,
          hostId: room.hostId,
          status: room.status,
          createdAt: room.createdAt,
        },
        currentUser: {
          userId: participant.userId,
          username: participant.username,
          role: participant.role,
          sessionToken,
        },
        playback: room.toSnapshot('system'),
        participants: room.getPublicParticipants(),
        pendingRequests: room.getActiveRequests(),
        chatHistory: room.chatHistory,
      };

      socket.emit('room_created', responsePayload);
      callback?.({ success: true, data: responsePayload });
    } catch (error: any) {
      console.error('[Socket:create_room] error:', error);
      const err = { code: 'INTERNAL_ERROR', message: 'Failed to create watch party room.' };
      socket.emit('error', err);
      callback?.({ success: false, error: err });
    }
  });

  // JOIN ROOM EVENT
  socket.on('join_room', async (rawPayload, callback) => {
    try {
      if (!socketRateLimiter.check(`${socket.id}:join_room`, 10, 10000)) {
        const err = { code: 'RATE_LIMITED', message: 'Too many join requests. Please wait a moment.' };
        socket.emit('error', err);
        callback?.({ success: false, error: err });
        return;
      }

      const normalizedPayload = {
        ...rawPayload,
        roomCode: rawPayload?.roomCode ? normalizeRoomCode(rawPayload.roomCode) : '',
      };

      const parseResult = JoinRoomEventSchema.safeParse(normalizedPayload);
      if (!parseResult.success) {
        const err = {
          code: 'INVALID_PAYLOAD',
          message: parseResult.error.errors[0]?.message || 'Invalid room code or username',
        };
        socket.emit('error', err);
        callback?.({ success: false, error: err });
        return;
      }

      const { roomCode, username, sessionToken } = parseResult.data;

      try {
        const { room, participant, sessionToken: activeToken, isReconnect } =
          await roomManager.joinRoom(roomCode, username, sessionToken, socket.id);

        socket.join(room.roomCode);

        const responsePayload = {
          room: {
            id: room.id,
            roomCode: room.roomCode,
            name: room.name,
            hostId: room.hostId,
            status: room.status,
            createdAt: room.createdAt,
          },
          currentUser: {
            userId: participant.userId,
            username: participant.username,
            role: participant.role,
            sessionToken: activeToken,
          },
          playback: room.toSnapshot('system'),
          participants: room.getPublicParticipants(),
          pendingRequests: room.getActiveRequests(),
          chatHistory: room.chatHistory,
        };

        socket.emit('room_joined', responsePayload);
        callback?.({ success: true, data: responsePayload });

        if (isReconnect) {
          socket.to(room.roomCode).emit('participant_reconnected', {
            userId: participant.userId,
            username: participant.username,
          });
        } else {
          socket.to(room.roomCode).emit('participant_joined', {
            participant: participant.toPublic(),
            message: `${participant.username} joined the party.`,
          });
        }
      } catch (joinErr: any) {
        if (joinErr.message === 'ROOM_NOT_FOUND') {
          const err = { code: 'ROOM_NOT_FOUND', message: 'Room not found or no longer available.' };
          socket.emit('error', err);
          callback?.({ success: false, error: err });
        } else if (joinErr.message === 'USERNAME_TAKEN') {
          const err = { code: 'USERNAME_TAKEN', message: 'That username is already taken in this room.' };
          socket.emit('error', err);
          callback?.({ success: false, error: err });
        } else {
          throw joinErr;
        }
      }
    } catch (error: any) {
      console.error('[Socket:join_room] error:', error);
      const err = { code: 'INTERNAL_ERROR', message: 'Failed to join watch party.' };
      socket.emit('error', err);
      callback?.({ success: false, error: err });
    }
  });

  // LEAVE ROOM EVENT
  socket.on('leave_room', async () => {
    try {
      const result = await roomManager.leaveRoom(socket.id);
      if (result) {
        const { room, participant, hostChanged, roomClosed } = result;
        socket.leave(room.roomCode);

        if (roomClosed) {
          io.to(room.roomCode).emit('room_ended', {
            message: 'This watch party has ended because all participants left.',
            endedBy: participant.username,
          });
        } else {
          io.to(room.roomCode).emit('participant_left', {
            userId: participant.userId,
            username: participant.username,
          });

          if (hostChanged) {
            io.to(room.roomCode).emit('host_transferred', {
              newHostId: room.hostId,
              previousHostId: participant.userId,
            });
          }
        }
      }
    } catch (error) {
      console.error('[Socket:leave_room] error:', error);
    }
  });

  // END ROOM EVENT (Host only)
  socket.on('end_room', async () => {
    try {
      const resolved = roomManager.findRoomBySocket(socket.id);
      if (!resolved) {
        socket.emit('error', { code: 'NOT_IN_ROOM', message: 'You are not in an active room.' });
        return;
      }

      const { room, participant } = resolved;
      if (room.hostId !== participant.userId) {
        socket.emit('error', { code: 'UNAUTHORIZED', message: 'Only the Host can end the watch party.' });
        return;
      }

      await roomManager.closeRoom(room.roomCode);
      io.to(room.roomCode).emit('room_ended', {
        message: 'The Host has ended this watch party.',
        endedBy: participant.username,
      });
    } catch (error) {
      console.error('[Socket:end_room] error:', error);
    }
  });
}
