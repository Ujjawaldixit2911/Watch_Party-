export type Role = 'HOST' | 'MODERATOR' | 'PARTICIPANT';

export type PlaybackState = 'PLAYING' | 'PAUSED';

export type RoomStatus = 'ACTIVE' | 'CLOSED';

export type ControlRequestType = 'PLAY' | 'PAUSE' | 'SEEK' | 'CHANGE_VIDEO';

export type ControlRequestDecision = 'APPROVED' | 'REJECTED';

export interface PlaybackSnapshot {
  videoId: string | null;
  time: number;                 // effective time in seconds at serverTimestamp
  state: PlaybackState;
  serverTimestamp: number;      // server epoch ms when snapshot was computed
  version: number;              // monotonic counter; clients ignore older versions
  triggeredBy: string;          // userId or "system"
}

export interface ParticipantPublic {
  userId: string;
  username: string;
  role: Role;
  isConnected: boolean;
  joinedAt: number;
}

export interface ControlRequestPayload {
  time?: number;
  videoId?: string;
}

export interface ControlRequest {
  requestId: string;
  requesterId: string;
  requesterName: string;
  type: ControlRequestType;
  payload?: ControlRequestPayload;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  role: Role;
  content: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface RoomJoinedPayload {
  room: {
    id: string;
    roomCode: string;
    name: string | null;
    hostId: string;
    status: RoomStatus;
    createdAt: number;
  };
  currentUser: {
    userId: string;
    username: string;
    role: Role;
    sessionToken: string;
  };
  playback: PlaybackSnapshot;
  participants: ParticipantPublic[];
  pendingRequests: ControlRequest[];
  chatHistory: ChatMessage[];
}

export interface CreateRoomResponse {
  roomCode: string;
  userId: string;
  sessionToken: string;
  roomName: string | null;
}

export interface CheckRoomResponse {
  exists: boolean;
  status?: RoomStatus;
  roomName?: string | null;
}
