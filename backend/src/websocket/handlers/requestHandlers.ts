import { Server, Socket } from 'socket.io';
import crypto from 'crypto';
import {
  ClientToServerEvents,
  ControlRequest,
  RequestControlEventSchema,
  ResolveControlRequestEventSchema,
  ServerToClientEvents,
} from '@watchparty/shared';
import { RoomManager } from '../../services/RoomManager';
import { PermissionService } from '../../services/PermissionService';
import { socketRateLimiter } from '../../services/RateLimiter';

export function registerRequestHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager
): void {
  // REQUEST CONTROL (Participant)
  socket.on('request_control', (rawPayload) => {
    try {
      if (!socketRateLimiter.check(`${socket.id}:request_control`, 5, 10000)) {
        socket.emit('error', { code: 'RATE_LIMITED', message: 'Please wait before requesting again.' });
        return;
      }

      const parseResult = RequestControlEventSchema.safeParse(rawPayload);
      if (!parseResult.success) {
        socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Invalid control request payload.' });
        return;
      }

      const resolved = roomManager.findRoomBySocket(socket.id);
      if (!resolved) {
        socket.emit('error', { code: 'NOT_IN_ROOM', message: 'You are not in an active room.' });
        return;
      }

      const { room, participant } = resolved;
      const { type, payload } = parseResult.data;

      // Limit: Max 1 pending request per participant per type
      const activeRequests = room.getActiveRequests();
      const existing = activeRequests.find(
        (r) => r.requesterId === participant.userId && r.type === type
      );
      if (existing) {
        socket.emit('error', {
          code: 'REQUEST_PENDING',
          message: `You already have a pending ${type.toLowerCase()} request.`,
        });
        return;
      }

      const request: ControlRequest = {
        requestId: crypto.randomUUID(),
        requesterId: participant.userId,
        requesterName: participant.username,
        type,
        payload,
        createdAt: Date.now(),
      };

      room.addPendingRequest(request);

      // Emit to Host and Moderators only
      for (const p of room.participants.values()) {
        if ((p.role === 'HOST' || p.role === 'MODERATOR') && p.socketId) {
          io.to(p.socketId).emit('control_request_created', request);
        }
      }
    } catch (error) {
      console.error('[Socket:request_control] error:', error);
    }
  });

  // RESOLVE CONTROL REQUEST (Host / Moderator)
  socket.on('resolve_control_request', async (rawPayload) => {
    try {
      const parseResult = ResolveControlRequestEventSchema.safeParse(rawPayload);
      if (!parseResult.success) {
        socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Invalid resolution payload.' });
        return;
      }

      const resolved = roomManager.findRoomBySocket(socket.id);
      if (!resolved) {
        socket.emit('error', { code: 'NOT_IN_ROOM', message: 'You are not in an active room.' });
        return;
      }

      const { room, participant: resolver } = resolved;
      if (!PermissionService.can(resolver.role, 'RESOLVE_REQUEST')) {
        socket.emit('error', {
          code: 'UNAUTHORIZED',
          message: 'Only the Host or a Moderator can approve or reject control requests.',
        });
        return;
      }

      const { requestId, decision } = parseResult.data;
      const request = room.resolvePendingRequest(requestId);

      if (!request) {
        socket.emit('error', {
          code: 'ALREADY_HANDLED',
          message: 'This request has already been handled or has expired.',
        });
        return;
      }

      // If approved, execute action using the same authoritative path
      if (decision === 'APPROVED') {
        if (request.type === 'PLAY') {
          const targetTime = request.payload?.time ?? room.getEffectiveTime();
          const snapshot = room.applyPlayback('PLAYING', targetTime, request.requesterId);
          io.to(room.roomCode).emit('play', snapshot);
        } else if (request.type === 'PAUSE') {
          const targetTime = request.payload?.time ?? room.getEffectiveTime();
          const snapshot = room.applyPlayback('PAUSED', targetTime, request.requesterId);
          io.to(room.roomCode).emit('pause', snapshot);
        } else if (request.type === 'SEEK') {
          const targetTime = request.payload?.time ?? 0;
          const snapshot = room.applyPlayback(room.playbackState, targetTime, request.requesterId);
          io.to(room.roomCode).emit('seek', snapshot);
        } else if (request.type === 'CHANGE_VIDEO' && request.payload?.videoId) {
          const snapshot = room.changeVideo(request.payload.videoId, request.requesterId);
          await roomManager.persistVideoChange(room.id, request.payload.videoId);
          io.to(room.roomCode).emit('video_changed', snapshot);
        }
      }

      // Broadcast resolution
      io.to(room.roomCode).emit('control_request_resolved', {
        requestId,
        decision,
        resolvedBy: resolver.username,
        request,
      });
    } catch (error) {
      console.error('[Socket:resolve_control_request] error:', error);
    }
  });
}
