import { describe, it, expect, beforeEach } from 'vitest';
import { Room } from '../models/Room';
import { Participant } from '../models/Participant';

describe('Room Model', () => {
  let room: Room;

  beforeEach(() => {
    room = new Room({
      id: 'room-1',
      roomCode: 'WK-TEST1',
      name: 'Test Party',
      hostId: 'user-host',
      currentVideoId: 'dQw4w9WgXcQ',
    });

    const host = new Participant({
      userId: 'user-host',
      username: 'Alice (Host)',
      role: 'HOST',
      sessionTokenHash: 'hash-alice',
    });

    const viewer = new Participant({
      userId: 'user-viewer',
      username: 'Bob',
      role: 'PARTICIPANT',
      sessionTokenHash: 'hash-bob',
    });

    room.addParticipant(host);
    room.addParticipant(viewer);
  });

  it('correctly calculates effective time when PAUSED', () => {
    room.applyPlayback('PAUSED', 45, 'user-host');
    expect(room.playbackState).toBe('PAUSED');
    expect(room.getEffectiveTime()).toBe(45);
  });

  it('correctly advances effective time when PLAYING', async () => {
    room.applyPlayback('PLAYING', 10, 'user-host');
    expect(room.playbackState).toBe('PLAYING');

    // Simulate small time progression
    await new Promise((resolve) => setTimeout(resolve, 50));
    const effectiveTime = room.getEffectiveTime();
    expect(effectiveTime).toBeGreaterThanOrEqual(10.04);
  });

  it('monotonically increments version counter on state changes', () => {
    const initialVersion = room.version;
    const snap1 = room.applyPlayback('PLAYING', 0, 'user-host');
    expect(snap1.version).toBe(initialVersion + 1);

    const snap2 = room.applyPlayback('PAUSED', 15, 'user-host');
    expect(snap2.version).toBe(initialVersion + 2);

    const snap3 = room.changeVideo('abc12345678', 'user-host');
    expect(snap3.version).toBe(initialVersion + 3);
    expect(snap3.state).toBe('PAUSED');
    expect(snap3.time).toBe(0);
  });

  it('transfers host cleanly and updates previous host to moderator', () => {
    expect(room.hostId).toBe('user-host');
    const success = room.transferHost('user-viewer');
    expect(success).toBe(true);
    expect(room.hostId).toBe('user-viewer');

    const newHost = room.getParticipant('user-viewer');
    const oldHost = room.getParticipant('user-host');

    expect(newHost?.role).toBe('HOST');
    expect(oldHost?.role).toBe('MODERATOR');
  });

  it('prevents duplicate case-insensitive usernames', () => {
    expect(room.isUsernameTaken('bob')).toBe(true);
    expect(room.isUsernameTaken('BOB')).toBe(true);
    expect(room.isUsernameTaken('Charlie')).toBe(false);
  });
});
