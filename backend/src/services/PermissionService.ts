import { Role } from '@watchparty/shared';

export type Action =
  | 'PLAYBACK_CONTROL'
  | 'RESOLVE_REQUEST'
  | 'ASSIGN_ROLE'
  | 'REMOVE_PARTICIPANT'
  | 'TRANSFER_HOST'
  | 'END_ROOM'
  | 'REQUEST_CONTROL'
  | 'CHAT';

export class PermissionService {
  /**
   * Checks if a role is permitted to perform a general action.
   */
  public static can(role: Role, action: Action): boolean {
    switch (action) {
      case 'PLAYBACK_CONTROL':
      case 'RESOLVE_REQUEST':
        return role === 'HOST' || role === 'MODERATOR';

      case 'ASSIGN_ROLE':
      case 'REMOVE_PARTICIPANT':
      case 'TRANSFER_HOST':
      case 'END_ROOM':
        return role === 'HOST';

      case 'REQUEST_CONTROL':
        // Participants use requests; Host/Moderator already have direct access
        return role === 'PARTICIPANT';

      case 'CHAT':
        return true;

      default:
        return false;
    }
  }

  /**
   * Validates if an actor can assign a role to a target participant.
   */
  public static canAssignRole(
    actorRole: Role,
    actorId: string,
    targetRole: Role,
    targetId: string,
    newRole: Role
  ): { allowed: boolean; reason?: string } {
    if (actorRole !== 'HOST') {
      return { allowed: false, reason: 'Only the Host can assign or change roles' };
    }

    if (actorId === targetId) {
      return { allowed: false, reason: 'You cannot change your own role' };
    }

    if (targetRole === 'HOST') {
      return { allowed: false, reason: 'The Host role cannot be modified. Use transfer host instead' };
    }

    if (newRole === 'HOST') {
      return { allowed: false, reason: 'Cannot assign HOST role directly. Use transfer host instead' };
    }

    return { allowed: true };
  }

  /**
   * Validates if an actor can remove a target participant.
   */
  public static canRemoveParticipant(
    actorRole: Role,
    actorId: string,
    targetRole: Role,
    targetId: string
  ): { allowed: boolean; reason?: string } {
    if (actorRole !== 'HOST') {
      return { allowed: false, reason: 'Only the Host can remove participants' };
    }

    if (actorId === targetId) {
      return { allowed: false, reason: 'You cannot remove yourself from the room' };
    }

    if (targetRole === 'HOST') {
      return { allowed: false, reason: 'The Host cannot be removed' };
    }

    return { allowed: true };
  }

  /**
   * Validates if an actor can transfer host role to a target participant.
   */
  public static canTransferHost(
    actorRole: Role,
    actorId: string,
    targetId: string
  ): { allowed: boolean; reason?: string } {
    if (actorRole !== 'HOST') {
      return { allowed: false, reason: 'Only the current Host can transfer host status' };
    }

    if (actorId === targetId) {
      return { allowed: false, reason: 'You are already the host' };
    }

    return { allowed: true };
  }
}
