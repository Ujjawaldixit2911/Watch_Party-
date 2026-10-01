import {
  ChatMessage,
  ControlRequest,
  ControlRequestDecision,
  ParticipantPublic,
  PlaybackSnapshot,
  Role,
  RoomJoinedPayload,
} from './types';
import {
  AssignRoleEventInput,
  ChangeVideoEventInput,
  CreateRoomEventInput,
  JoinRoomEventInput,
  PauseEventInput,
  PlayEventInput,
  RemoveParticipantEventInput,
  RequestControlEventInput,
  ResolveControlRequestEventInput,
  SeekEventInput,
  SendMessageEventInput,
  TransferHostEventInput,
} from './schemas';

export interface ServerErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

export interface ClientToServerEvents {
  create_room: (
    payload: CreateRoomEventInput,
    callback?: (response: { success: boolean; data?: RoomJoinedPayload; error?: ServerErrorResponse }) => void
  ) => void;
  join_room: (
    payload: JoinRoomEventInput,
    callback?: (response: { success: boolean; data?: RoomJoinedPayload; error?: ServerErrorResponse }) => void
  ) => void;
  leave_room: () => void;
  play: (payload: PlayEventInput) => void;
  pause: (payload: PauseEventInput) => void;
  seek: (payload: SeekEventInput) => void;
  change_video: (payload: ChangeVideoEventInput) => void;
  assign_role: (payload: AssignRoleEventInput) => void;
  remove_participant: (payload: RemoveParticipantEventInput) => void;
  transfer_host: (payload: TransferHostEventInput) => void;
  end_room: () => void;
  request_sync: () => void;
  request_control: (payload: RequestControlEventInput) => void;
  resolve_control_request: (payload: ResolveControlRequestEventInput) => void;
  send_message: (payload: SendMessageEventInput) => void;
  ping_time: (clientTimestamp: number, callback: (serverTimestamp: number) => void) => void;
}

export interface ServerToClientEvents {
  room_created: (data: RoomJoinedPayload) => void;
  room_joined: (data: RoomJoinedPayload) => void;
  sync_state: (data: PlaybackSnapshot) => void;
  play: (data: PlaybackSnapshot) => void;
  pause: (data: PlaybackSnapshot) => void;
  seek: (data: PlaybackSnapshot) => void;
  video_changed: (data: PlaybackSnapshot) => void;
  participant_joined: (data: { participant: ParticipantPublic; message?: string }) => void;
  participant_left: (data: { userId: string; username: string }) => void;
  participant_reconnected: (data: { userId: string; username: string }) => void;
  role_assigned: (data: { userId: string; role: Role; assignedBy: string }) => void;
  participant_removed: (data: { userId: string; username: string; removedBy: string }) => void;
  host_transferred: (data: { newHostId: string; previousHostId: string }) => void;
  room_ended: (data: { message: string; endedBy: string }) => void;
  control_request_created: (data: ControlRequest) => void;
  control_request_resolved: (data: {
    requestId: string;
    decision: ControlRequestDecision;
    resolvedBy: string;
    request?: ControlRequest;
  }) => void;
  message_received: (data: ChatMessage) => void;
  error: (data: ServerErrorResponse) => void;
}
