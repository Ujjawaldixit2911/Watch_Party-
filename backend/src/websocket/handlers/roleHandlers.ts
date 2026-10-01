import { Server, Socket } from 'socket.io';
import {
  AssignRoleEventSchema,
  ClientToServerEvents,
  RemoveParticipantEventSchema,
  ServerToClientEvents,
  TransferHostEventSchema,
} from '@watchparty/shared';
import { RoomManager } from '../../services/RoomManager';
import { PermissionService } from '../../services/PermissionService';

export function registerRoleHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager
): void {
  // ASSIGN ROLE (Host only)
  socket.on('assign_role', async (rawPayload) => {
    try {
      const parseResult = AssignRoleEventSchema.safeParse(rawPayload);
      if (!parseResult.success) {
        socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Invalid role assignment payload.' });
        return;
      }

      const resolved = roomManager.findRoomBySocket(socket.id);
      if (!resolved) {
        socket.emit('error', { code: 'NOT_IN_ROOM', message: 'You are not in an active room.' });
        return;
      }

      const { room, participant: actor } = resolved;
      const { targetUserId, role: newRole } = parseResult.data;

      const target = room.getParticipant(targetUserId);
      if (!target) {
        socket.emit('error', { code: 'PARTICIPANT_NOT_FOUND', message: 'Target participant was not found.' });
        return;
      }

      const check = PermissionService.canAssignRole(
        actor.role,
        actor.userId,
        target.role,
        target.userId,
        newRole
      );

      if (!check.allowed) {
        socket.emit('error', {
          code: 'UNAUTHORIZED',
          message: check.reason || 'You are not allowed to change this role.',
        });
        return;
      }

      room.assignRole(targetUserId, newRole);
      await roomManager.persistRoleChange(targetUserId, newRole);

      io.to(room.roomCode).emit('role_assigned', {
        userId: targetUserId,
        role: newRole,
        assignedBy: actor.username,
      });
    } catch (error) {
      console.error('[Socket:assign_role] error:', error);
    }
  });

  // REMOVE PARTICIPANT (Host only)
  socket.on('remove_participant', async (rawPayload) => {
    try {
      const parseResult = RemoveParticipantEventSchema.safeParse(rawPayload);
      if (!parseResult.success) {
        socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Invalid remove participant payload.' });
        return;
      }

      const resolved = roomManager.findRoomBySocket(socket.id);
      if (!resolved) {
        socket.emit('error', { code: 'NOT_IN_ROOM', message: 'You are not in an active room.' });
        return;
      }

      const { room, participant: actor } = resolved;
      const { targetUserId } = parseResult.data;

      const target = room.getParticipant(targetUserId);
      if (!target) {
        socket.emit('error', { code: 'PARTICIPANT_NOT_FOUND', message: 'Target participant was not found.' });
        return;
      }

      const check = PermissionService.canRemoveParticipant(
        actor.role,
        actor.userId,
        target.role,
        target.userId
      );

      if (!check.allowed) {
        socket.emit('error', {
          code: 'UNAUTHORIZED',
          message: check.reason || 'You are not allowed to remove this participant.',
        });
        return;
      }

      const targetSocketId = target.socketId;
      room.removeParticipant(targetUserId);
      await roomManager.persistParticipantRemoval(targetUserId);

      // Notify the removed user specifically before disconnecting
      if (targetSocketId) {
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit('error', {
            code: 'REMOVED_FROM_ROOM',
            message: 'You have been removed from this party.',
          });
          targetSocket.leave(room.roomCode);
          targetSocket.disconnect(true);
        }
      }

      // Broadcast to room
      io.to(room.roomCode).emit('participant_removed', {
        userId: targetUserId,
        username: target.username,
        removedBy: actor.username,
      });
    } catch (error) {
      console.error('[Socket:remove_participant] error:', error);
    }
  });

  // TRANSFER HOST (Host only)
  socket.on('transfer_host', async (rawPayload) => {
    try {
      const parseResult = TransferHostEventSchema.safeParse(rawPayload);
      if (!parseResult.success) {
        socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Invalid host transfer payload.' });
        return;
      }

      const resolved = roomManager.findRoomBySocket(socket.id);
      if (!resolved) {
        socket.emit('error', { code: 'NOT_IN_ROOM', message: 'You are not in an active room.' });
        return;
      }

      const { room, participant: actor } = resolved;
      const { targetUserId } = parseResult.data;

      const target = room.getParticipant(targetUserId);
      if (!target) {
        socket.emit('error', { code: 'PARTICIPANT_NOT_FOUND', message: 'Target participant was not found.' });
        return;
      }

      const check = PermissionService.canTransferHost(actor.role, actor.userId, target.userId);
      if (!check.allowed) {
        socket.emit('error', {
          code: 'UNAUTHORIZED',
          message: check.reason || 'You are not allowed to transfer host status.',
        });
        return;
      }

      const previousHostId = room.hostId;
      room.transferHost(targetUserId);

      await roomManager.persistRoleChange(previousHostId, 'MODERATOR');
      await roomManager.persistRoleChange(targetUserId, 'HOST');

      io.to(room.roomCode).emit('host_transferred', {
        newHostId: targetUserId,
        previousHostId,
      });
    } catch (error) {
      console.error('[Socket:transfer_host] error:', error);
    }
  });
}
