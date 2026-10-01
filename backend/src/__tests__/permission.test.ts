import { describe, it, expect } from 'vitest';
import { PermissionService } from '../services/PermissionService';

describe('PermissionService', () => {
  it('allows Host to control playback and manage all room roles', () => {
    expect(PermissionService.can('HOST', 'PLAYBACK_CONTROL')).toBe(true);
    expect(PermissionService.can('HOST', 'RESOLVE_REQUEST')).toBe(true);
    expect(PermissionService.can('HOST', 'ASSIGN_ROLE')).toBe(true);
    expect(PermissionService.can('HOST', 'REMOVE_PARTICIPANT')).toBe(true);
    expect(PermissionService.can('HOST', 'TRANSFER_HOST')).toBe(true);
    expect(PermissionService.can('HOST', 'END_ROOM')).toBe(true);
    expect(PermissionService.can('HOST', 'CHAT')).toBe(true);
  });

  it('allows Moderator to control playback and resolve requests, but not manage roles/remove', () => {
    expect(PermissionService.can('MODERATOR', 'PLAYBACK_CONTROL')).toBe(true);
    expect(PermissionService.can('MODERATOR', 'RESOLVE_REQUEST')).toBe(true);
    expect(PermissionService.can('MODERATOR', 'ASSIGN_ROLE')).toBe(false);
    expect(PermissionService.can('MODERATOR', 'REMOVE_PARTICIPANT')).toBe(false);
    expect(PermissionService.can('MODERATOR', 'TRANSFER_HOST')).toBe(false);
    expect(PermissionService.can('MODERATOR', 'END_ROOM')).toBe(false);
    expect(PermissionService.can('MODERATOR', 'CHAT')).toBe(true);
  });

  it('restricts Participant to chat and request control only', () => {
    expect(PermissionService.can('PARTICIPANT', 'PLAYBACK_CONTROL')).toBe(false);
    expect(PermissionService.can('PARTICIPANT', 'RESOLVE_REQUEST')).toBe(false);
    expect(PermissionService.can('PARTICIPANT', 'ASSIGN_ROLE')).toBe(false);
    expect(PermissionService.can('PARTICIPANT', 'REMOVE_PARTICIPANT')).toBe(false);
    expect(PermissionService.can('PARTICIPANT', 'TRANSFER_HOST')).toBe(false);
    expect(PermissionService.can('PARTICIPANT', 'END_ROOM')).toBe(false);
    expect(PermissionService.can('PARTICIPANT', 'REQUEST_CONTROL')).toBe(true);
    expect(PermissionService.can('PARTICIPANT', 'CHAT')).toBe(true);
  });

  it('enforces single host and self-targeting invariants', () => {
    // Cannot assign role to self
    const selfAssign = PermissionService.canAssignRole('HOST', 'u1', 'HOST', 'u1', 'MODERATOR');
    expect(selfAssign.allowed).toBe(false);

    // Non-host cannot assign role
    const modAssign = PermissionService.canAssignRole('MODERATOR', 'u2', 'PARTICIPANT', 'u3', 'MODERATOR');
    expect(modAssign.allowed).toBe(false);

    // Cannot remove self
    const selfRemove = PermissionService.canRemoveParticipant('HOST', 'u1', 'HOST', 'u1');
    expect(selfRemove.allowed).toBe(false);

    // Host cannot remove another host
    const removeHost = PermissionService.canRemoveParticipant('HOST', 'u1', 'HOST', 'u2');
    expect(removeHost.allowed).toBe(false);

    // Host can remove a participant
    const validRemove = PermissionService.canRemoveParticipant('HOST', 'u1', 'PARTICIPANT', 'u3');
    expect(validRemove.allowed).toBe(true);

    // Host transfer to another user is valid
    const validTransfer = PermissionService.canTransferHost('HOST', 'u1', 'u2');
    expect(validTransfer.allowed).toBe(true);

    // Host transfer to self is invalid
    const selfTransfer = PermissionService.canTransferHost('HOST', 'u1', 'u1');
    expect(selfTransfer.allowed).toBe(false);
  });
});
