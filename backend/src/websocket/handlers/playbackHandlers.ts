import { Server, Socket } from 'socket.io';
import {
  ChangeVideoEventSchema,
  ClientToServerEvents,
  PauseEventSchema,
  PlayEventSchema,
  SeekEventSchema,
  ServerToClientEvents,
} from '@watchparty/shared';
import { RoomManager } from '../../services/RoomManager';
import { PermissionService } from '../../services/PermissionService';
import { socketRateLimiter } from '../../services/RateLimiter';

export function registerPlaybackHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager
): void {
  // PLAY
  socket.on('play', (rawPayload) => {
    try {
      if (!socketRateLimiter.check(`${socket.id}:playback`, 10, 1000)) {
        socket.emit('error', { code: 'RATE_LIMITED', message: 'Playback rate limit exceeded.' });
        return;
      }

      const parseResult = PlayEventSchema.safeParse(rawPayload);
      if (!parseResult.success) {
        socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Invalid playback time payload.' });
        return;
      }

      const resolved = roomManager.findRoomBySocket(socket.id);
      if (!resolved) {
        socket.emit('error', { code: 'NOT_IN_ROOM', message: 'You are not in an active room.' });
        return;
      }

      const { room, participant } = resolved;
      if (!PermissionService.can(participant.role, 'PLAYBACK_CONTROL')) {
        socket.emit('error', {
          code: 'UNAUTHORIZED',
          message: 'Only the Host or a Moderator can control playback.',
        });
        return;
      }

      const { time } = parseResult.data;
      const snapshot = room.applyPlayback('PLAYING', time, participant.userId);

      // Broadcast authoritative state to EVERYONE in the room including sender
      io.to(room.roomCode).emit('play', snapshot);
    } catch (error) {
      console.error('[Socket:play] error:', error);
    }
  });

  // PAUSE
  socket.on('pause', (rawPayload) => {
    try {
      if (!socketRateLimiter.check(`${socket.id}:playback`, 10, 1000)) {
        socket.emit('error', { code: 'RATE_LIMITED', message: 'Playback rate limit exceeded.' });
        return;
      }

      const parseResult = PauseEventSchema.safeParse(rawPayload);
      if (!parseResult.success) {
        socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Invalid playback pause payload.' });
        return;
      }

      const resolved = roomManager.findRoomBySocket(socket.id);
      if (!resolved) {
        socket.emit('error', { code: 'NOT_IN_ROOM', message: 'You are not in an active room.' });
        return;
      }

      const { room, participant } = resolved;
      if (!PermissionService.can(participant.role, 'PLAYBACK_CONTROL')) {
        socket.emit('error', {
          code: 'UNAUTHORIZED',
          message: 'Only the Host or a Moderator can pause playback.',
        });
        return;
      }

      const { time } = parseResult.data;
      const snapshot = room.applyPlayback('PAUSED', time, participant.userId);

      io.to(room.roomCode).emit('pause', snapshot);
    } catch (error) {
      console.error('[Socket:pause] error:', error);
    }
  });

  // SEEK
  socket.on('seek', (rawPayload) => {
    try {
      if (!socketRateLimiter.check(`${socket.id}:playback`, 10, 1000)) {
        socket.emit('error', { code: 'RATE_LIMITED', message: 'Seek rate limit exceeded.' });
        return;
      }

      const parseResult = SeekEventSchema.safeParse(rawPayload);
      if (!parseResult.success) {
        socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Invalid seek position payload.' });
        return;
      }

      const resolved = roomManager.findRoomBySocket(socket.id);
      if (!resolved) {
        socket.emit('error', { code: 'NOT_IN_ROOM', message: 'You are not in an active room.' });
        return;
      }

      const { room, participant } = resolved;
      if (!PermissionService.can(participant.role, 'PLAYBACK_CONTROL')) {
        socket.emit('error', {
          code: 'UNAUTHORIZED',
          message: 'Only the Host or a Moderator can seek playback.',
        });
        return;
      }

      const { time } = parseResult.data;
      // Seek retains current state (PLAYING or PAUSED)
      const snapshot = room.applyPlayback(room.playbackState, time, participant.userId);

      io.to(room.roomCode).emit('seek', snapshot);
    } catch (error) {
      console.error('[Socket:seek] error:', error);
    }
  });

  // CHANGE VIDEO
  socket.on('change_video', async (rawPayload) => {
    try {
      if (!socketRateLimiter.check(`${socket.id}:change_video`, 5, 5000)) {
        socket.emit('error', { code: 'RATE_LIMITED', message: 'Please wait before changing video again.' });
        return;
      }

      const parseResult = ChangeVideoEventSchema.safeParse(rawPayload);
      if (!parseResult.success) {
        socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Invalid YouTube Video ID.' });
        return;
      }

      const resolved = roomManager.findRoomBySocket(socket.id);
      if (!resolved) {
        socket.emit('error', { code: 'NOT_IN_ROOM', message: 'You are not in an active room.' });
        return;
      }

      const { room, participant } = resolved;
      if (!PermissionService.can(participant.role, 'PLAYBACK_CONTROL')) {
        socket.emit('error', {
          code: 'UNAUTHORIZED',
          message: 'Only the Host or a Moderator can change the video.',
        });
        return;
      }

      const { videoId } = parseResult.data;
      const snapshot = room.changeVideo(videoId, participant.userId);

      // Persist durable video state to DB
      await roomManager.persistVideoChange(room.id, videoId);

      io.to(room.roomCode).emit('video_changed', snapshot);
    } catch (error) {
      console.error('[Socket:change_video] error:', error);
    }
  });

  // REQUEST SYNC
  socket.on('request_sync', () => {
    const resolved = roomManager.findRoomBySocket(socket.id);
    if (!resolved) return;

    const { room } = resolved;
    socket.emit('sync_state', room.toSnapshot('system'));
  });

  // PING TIME (for client clock offset calculation)
  socket.on('ping_time', (_clientTimestamp, callback) => {
    if (typeof callback === 'function') {
      callback(Date.now());
    }
  });
}
