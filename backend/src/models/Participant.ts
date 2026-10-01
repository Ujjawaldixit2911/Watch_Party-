import { ParticipantPublic, Role } from '@watchparty/shared';

export interface ParticipantProps {
  userId: string;
  username: string;
  role: Role;
  sessionTokenHash: string;
  socketId?: string | null;
  joinedAt?: number;
  isConnected?: boolean;
}

export class Participant {
  public readonly userId: string;
  public username: string;
  public role: Role;
  public readonly sessionTokenHash: string;
  public socketId: string | null;
  public readonly joinedAt: number;
  public isConnected: boolean;
  public lastDisconnectedAt: number | null;

  constructor(props: ParticipantProps) {
    this.userId = props.userId;
    this.username = props.username;
    this.role = props.role;
    this.sessionTokenHash = props.sessionTokenHash;
    this.socketId = props.socketId ?? null;
    this.joinedAt = props.joinedAt ?? Date.now();
    this.isConnected = props.isConnected ?? true;
    this.lastDisconnectedAt = null;
  }

  public setConnected(socketId: string): void {
    this.isConnected = true;
    this.socketId = socketId;
    this.lastDisconnectedAt = null;
  }

  public setDisconnected(): void {
    this.isConnected = false;
    this.socketId = null;
    this.lastDisconnectedAt = Date.now();
  }

  public toPublic(): ParticipantPublic {
    return {
      userId: this.userId,
      username: this.username,
      role: this.role,
      isConnected: this.isConnected,
      joinedAt: this.joinedAt,
    };
  }
}
