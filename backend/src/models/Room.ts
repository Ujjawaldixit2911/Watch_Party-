import {
  ChatMessage,
  ControlRequest,
  ParticipantPublic,
  PlaybackSnapshot,
  PlaybackState,
  Role,
  RoomStatus,
} from '@watchparty/shared';
import { Participant } from './Participant';

export interface RoomProps {
  id: string;
  roomCode: string;
  name?: string | null;
  hostId: string;
  currentVideoId?: string | null;
  createdAt?: number;
}

export class Room {
  public readonly id: string;
  public readonly roomCode: string;
  public readonly name: string | null;
  public hostId: string;
  public currentVideoId: string | null;
  public storedCurrentTime: number;
  public playbackState: PlaybackState;
  public lastStateUpdatedAt: number;
  public version: number;
  public status: RoomStatus;
  public readonly createdAt: number;
  public closedAt: number | null;

  public participants = new Map<string, Participant>();
  public pendingRequests = new Map<string, ControlRequest>();
  public chatHistory: ChatMessage[] = [];

  constructor(props: RoomProps) {
    this.id = props.id;
    this.roomCode = props.roomCode;
    this.name = props.name ?? null;
    this.hostId = props.hostId;
    this.currentVideoId = props.currentVideoId ?? 'kJQP7kiw5Fk'; // default starter video (Despacito)
    this.storedCurrentTime = 0;
    this.playbackState = 'PAUSED';
    this.lastStateUpdatedAt = Date.now();
    this.version = 1;
    this.status = 'ACTIVE';
    this.createdAt = props.createdAt ?? Date.now();
    this.closedAt = null;
  }

  /**
   * Computes the current server-authoritative playback time.
   * If PLAYING: storedCurrentTime + elapsed seconds since last state update.
   * If PAUSED: storedCurrentTime.
   */
  public getEffectiveTime(): number {
    if (this.playbackState === 'PLAYING') {
      const elapsedSeconds = (Date.now() - this.lastStateUpdatedAt) / 1000;
      return Math.max(0, this.storedCurrentTime + elapsedSeconds);
    }
    return Math.max(0, this.storedCurrentTime);
  }

  /**
   * Generates a complete authoritative playback snapshot.
   */
  public toSnapshot(triggeredBy = 'system'): PlaybackSnapshot {
    return {
      videoId: this.currentVideoId,
      time: this.getEffectiveTime(),
      state: this.playbackState,
      serverTimestamp: Date.now(),
      version: this.version,
      triggeredBy,
    };
  }

  /**
   * Updates playback state (PLAY/PAUSE/SEEK) monotonically.
   */
  public applyPlayback(state: PlaybackState, time: number, triggeredBy: string): PlaybackSnapshot {
    this.storedCurrentTime = Math.max(0, time);
    this.playbackState = state;
    this.lastStateUpdatedAt = Date.now();
    this.version += 1;
    return this.toSnapshot(triggeredBy);
  }

  /**
   * Changes the room's current video and resets playback position to 0 in PAUSED state.
   */
  public changeVideo(videoId: string, triggeredBy: string): PlaybackSnapshot {
    this.currentVideoId = videoId;
    this.storedCurrentTime = 0;
    this.playbackState = 'PAUSED';
    this.lastStateUpdatedAt = Date.now();
    this.version += 1;
    return this.toSnapshot(triggeredBy);
  }

  /**
   * Adds or updates a participant in the room.
   */
  public addParticipant(participant: Participant): void {
    this.participants.set(participant.userId, participant);
  }

  public getParticipant(userId: string): Participant | undefined {
    return this.participants.get(userId);
  }

  public getParticipantBySocket(socketId: string): Participant | undefined {
    for (const participant of this.participants.values()) {
      if (participant.socketId === socketId) {
        return participant;
      }
    }
    return undefined;
  }

  public getParticipantByTokenHash(tokenHash: string): Participant | undefined {
    for (const participant of this.participants.values()) {
      if (participant.sessionTokenHash === tokenHash) {
        return participant;
      }
    }
    return undefined;
  }

  public isUsernameTaken(username: string, excludeUserId?: string): boolean {
    const normalized = username.trim().toLowerCase();
    for (const participant of this.participants.values()) {
      if (excludeUserId && participant.userId === excludeUserId) continue;
      if (participant.username.trim().toLowerCase() === normalized) {
        return true;
      }
    }
    return false;
  }

  public removeParticipant(userId: string): boolean {
    // Drop any pending requests from this user
    for (const [reqId, req] of this.pendingRequests.entries()) {
      if (req.requesterId === userId) {
        this.pendingRequests.delete(reqId);
      }
    }
    return this.participants.delete(userId);
  }

  public assignRole(userId: string, newRole: Role): boolean {
    const participant = this.participants.get(userId);
    if (!participant) return false;
    participant.role = newRole;
    return true;
  }

  public transferHost(newHostId: string): boolean {
    const newHost = this.participants.get(newHostId);
    const oldHost = this.participants.get(this.hostId);
    if (!newHost) return false;

    if (oldHost) {
      oldHost.role = 'MODERATOR'; // Old host becomes moderator
    }
    newHost.role = 'HOST';
    this.hostId = newHostId;
    return true;
  }

  public addPendingRequest(req: ControlRequest): void {
    this.pendingRequests.set(req.requestId, req);
  }

  public resolvePendingRequest(requestId: string): ControlRequest | undefined {
    const req = this.pendingRequests.get(requestId);
    if (req) {
      this.pendingRequests.delete(requestId);
    }
    return req;
  }

  public getActiveRequests(): ControlRequest[] {
    const now = Date.now();
    const active: ControlRequest[] = [];
    // Auto-expire requests older than 2 minutes (120000ms)
    for (const [id, req] of this.pendingRequests.entries()) {
      if (now - req.createdAt > 2 * 60 * 1000) {
        this.pendingRequests.delete(id);
      } else {
        active.push(req);
      }
    }
    return active;
  }

  public addChatMessage(msg: ChatMessage): void {
    this.chatHistory.push(msg);
    // Keep only the last 100 messages in memory
    if (this.chatHistory.length > 100) {
      this.chatHistory.shift();
    }
  }

  public getPublicParticipants(): ParticipantPublic[] {
    return Array.from(this.participants.values()).map((p) => p.toPublic());
  }

  public getConnectedCount(): number {
    let count = 0;
    for (const p of this.participants.values()) {
      if (p.isConnected) count++;
    }
    return count;
  }

  public close(): void {
    this.status = 'CLOSED';
    this.closedAt = Date.now();
  }
}
