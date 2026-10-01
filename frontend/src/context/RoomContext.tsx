import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  ChatMessage,
  ControlRequest,
  ParticipantPublic,
  PlaybackSnapshot,
  Role,
  RoomJoinedPayload,
  RoomStatus,
} from '@watchparty/shared';
import { socket } from '../services/socket';
import { getSession, saveSession, clearSession } from '../utils/storage';
import { toast } from 'sonner';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface RoomState {
  currentUser: {
    userId: string;
    username: string;
    role: Role;
    sessionToken: string;
  } | null;
  room: {
    id: string;
    roomCode: string;
    name: string | null;
    hostId: string;
    status: RoomStatus;
    createdAt: number;
  } | null;
  participants: ParticipantPublic[];
  playback: PlaybackSnapshot;
  pendingRequests: ControlRequest[];
  chatHistory: ChatMessage[];
  connectionStatus: ConnectionStatus;
  clockOffset: number;
  isAutoplayBlocked: boolean;
  activeVideoTitle: string;
}

type RoomAction =
  | { type: 'SET_ROOM_DATA'; payload: RoomJoinedPayload }
  | { type: 'SET_PLAYBACK'; payload: PlaybackSnapshot }
  | { type: 'ADD_PARTICIPANT'; payload: ParticipantPublic }
  | { type: 'REMOVE_PARTICIPANT'; payload: { userId: string } }
  | { type: 'PARTICIPANT_RECONNECTED'; payload: { userId: string } }
  | { type: 'SET_ROLE'; payload: { userId: string; role: Role } }
  | { type: 'SET_HOST'; payload: { newHostId: string; previousHostId: string } }
  | { type: 'ADD_REQUEST'; payload: ControlRequest }
  | { type: 'RESOLVE_REQUEST'; payload: { requestId: string } }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'SET_CLOCK_OFFSET'; payload: number }
  | { type: 'SET_AUTOPLAY_BLOCKED'; payload: boolean }
  | { type: 'SET_VIDEO_TITLE'; payload: string }
  | { type: 'RESET_ROOM' };

const initialPlayback: PlaybackSnapshot = {
  videoId: 'dQw4w9WgXcQ',
  time: 0,
  state: 'PAUSED',
  serverTimestamp: Date.now(),
  version: 0,
  triggeredBy: 'system',
};

const initialState: RoomState = {
  currentUser: null,
  room: null,
  participants: [],
  playback: initialPlayback,
  pendingRequests: [],
  chatHistory: [],
  connectionStatus: 'disconnected',
  clockOffset: 0,
  isAutoplayBlocked: false,
  activeVideoTitle: '',
};

function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case 'SET_ROOM_DATA': {
      return {
        ...state,
        currentUser: action.payload.currentUser,
        room: action.payload.room,
        participants: action.payload.participants,
        playback: action.payload.playback,
        pendingRequests: action.payload.pendingRequests,
        chatHistory: action.payload.chatHistory,
        connectionStatus: 'connected',
      };
    }

    case 'SET_PLAYBACK': {
      // Ignore if older or duplicate version
      if (action.payload.version <= state.playback.version) {
        return state;
      }
      return {
        ...state,
        playback: action.payload,
      };
    }

    case 'ADD_PARTICIPANT': {
      const exists = state.participants.some((p) => p.userId === action.payload.userId);
      if (exists) {
        return {
          ...state,
          participants: state.participants.map((p) =>
            p.userId === action.payload.userId ? action.payload : p
          ),
        };
      }
      return {
        ...state,
        participants: [...state.participants, action.payload],
      };
    }

    case 'REMOVE_PARTICIPANT': {
      return {
        ...state,
        participants: state.participants.filter((p) => p.userId !== action.payload.userId),
        pendingRequests: state.pendingRequests.filter((r) => r.requesterId !== action.payload.userId),
      };
    }

    case 'PARTICIPANT_RECONNECTED': {
      return {
        ...state,
        participants: state.participants.map((p) =>
          p.userId === action.payload.userId ? { ...p, isConnected: true } : p
        ),
      };
    }

    case 'SET_ROLE': {
      const updatedParticipants = state.participants.map((p) =>
        p.userId === action.payload.userId ? { ...p, role: action.payload.role } : p
      );
      const isCurrentUser = state.currentUser?.userId === action.payload.userId;
      return {
        ...state,
        participants: updatedParticipants,
        currentUser: isCurrentUser
          ? { ...state.currentUser!, role: action.payload.role }
          : state.currentUser,
      };
    }

    case 'SET_HOST': {
      const updatedParticipants = state.participants.map((p) => {
        if (p.userId === action.payload.newHostId) return { ...p, role: 'HOST' as Role };
        if (p.userId === action.payload.previousHostId) return { ...p, role: 'MODERATOR' as Role };
        return p;
      });
      const isNewHost = state.currentUser?.userId === action.payload.newHostId;
      const isOldHost = state.currentUser?.userId === action.payload.previousHostId;
      return {
        ...state,
        participants: updatedParticipants,
        room: state.room ? { ...state.room, hostId: action.payload.newHostId } : null,
        currentUser: state.currentUser
          ? {
              ...state.currentUser,
              role: isNewHost ? 'HOST' : isOldHost ? 'MODERATOR' : state.currentUser.role,
            }
          : null,
      };
    }

    case 'ADD_REQUEST': {
      return {
        ...state,
        pendingRequests: [...state.pendingRequests, action.payload],
      };
    }

    case 'RESOLVE_REQUEST': {
      return {
        ...state,
        pendingRequests: state.pendingRequests.filter(
          (r) => r.requestId !== action.payload.requestId
        ),
      };
    }

    case 'ADD_CHAT_MESSAGE': {
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.payload].slice(-100),
      };
    }

    case 'SET_CONNECTION_STATUS': {
      return {
        ...state,
        connectionStatus: action.payload,
      };
    }

    case 'SET_CLOCK_OFFSET': {
      return {
        ...state,
        clockOffset: action.payload,
      };
    }

    case 'SET_AUTOPLAY_BLOCKED': {
      return {
        ...state,
        isAutoplayBlocked: action.payload,
      };
    }

    case 'SET_VIDEO_TITLE': {
      return {
        ...state,
        activeVideoTitle: action.payload,
      };
    }

    case 'RESET_ROOM': {
      return {
        ...initialState,
        connectionStatus: 'disconnected',
      };
    }

    default:
      return state;
  }
}

interface RoomContextValue {
  state: RoomState;
  dispatch: React.Dispatch<RoomAction>;
  joinRoom: (roomCode: string, username: string, sessionToken?: string) => Promise<boolean>;
  createRoom: (username: string, roomName?: string) => Promise<string | null>;
  leaveRoom: () => void;
  sendPlay: (time: number) => void;
  sendPause: (time: number) => void;
  sendSeek: (time: number) => void;
  sendChangeVideo: (videoId: string) => void;
  sendAssignRole: (targetUserId: string, role: 'MODERATOR' | 'PARTICIPANT') => void;
  sendRemoveParticipant: (targetUserId: string) => void;
  sendTransferHost: (targetUserId: string) => void;
  sendEndRoom: () => void;
  sendRequestControl: (type: ControlRequest['type'], payload?: ControlRequest['payload']) => void;
  sendResolveControlRequest: (requestId: string, decision: 'APPROVED' | 'REJECTED') => void;
  sendChatMessage: (content: string) => void;
  resync: () => void;
}

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(roomReducer, initialState);

  // Sync clock offset on connection
  const estimateClockOffset = () => {
    const offsets: number[] = [];
    const pings = 5;

    for (let i = 0; i < pings; i++) {
      setTimeout(() => {
        const t0 = Date.now();
        socket.emit('ping_time', t0, (serverTimestamp) => {
          const t1 = Date.now();
          const rtt = t1 - t0;
          const serverTimeAtT1 = serverTimestamp + rtt / 2;
          offsets.push(serverTimeAtT1 - t1);

          if (offsets.length >= pings) {
            offsets.sort((a, b) => a - b);
            const medianOffset = offsets[Math.floor(offsets.length / 2)];
            dispatch({ type: 'SET_CLOCK_OFFSET', payload: medianOffset });
          }
        });
      }, i * 300);
    }
  };

  useEffect(() => {
    // Socket lifecycle listeners
    const handleConnect = () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
      estimateClockOffset();

      // Check if we have an existing room session to auto-reconnect
      if (state.room && state.currentUser) {
        socket.emit(
          'join_room',
          {
            roomCode: state.room.roomCode,
            username: state.currentUser.username,
            sessionToken: state.currentUser.sessionToken,
          },
          (res) => {
            if (res?.success && res.data) {
              dispatch({ type: 'SET_ROOM_DATA', payload: res.data });
              toast.success('Connection restored');
            }
          }
        );
      }
    };

    const handleDisconnect = () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
    };

    const handleConnectError = () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });
    };

    // Server-to-Client Event Handlers
    const handleRoomCreated = (data: RoomJoinedPayload) => {
      saveSession({
        roomCode: data.room.roomCode,
        userId: data.currentUser.userId,
        sessionToken: data.currentUser.sessionToken,
        username: data.currentUser.username,
      });
      dispatch({ type: 'SET_ROOM_DATA', payload: data });
    };

    const handleRoomJoined = (data: RoomJoinedPayload) => {
      saveSession({
        roomCode: data.room.roomCode,
        userId: data.currentUser.userId,
        sessionToken: data.currentUser.sessionToken,
        username: data.currentUser.username,
      });
      dispatch({ type: 'SET_ROOM_DATA', payload: data });
    };

    const handlePlaybackUpdate = (snapshot: PlaybackSnapshot) => {
      dispatch({ type: 'SET_PLAYBACK', payload: snapshot });
    };

    const handleParticipantJoined = (data: { participant: ParticipantPublic; message?: string }) => {
      dispatch({ type: 'ADD_PARTICIPANT', payload: data.participant });
      toast.info(`${data.participant.username} joined the party`);
    };

    const handleParticipantLeft = (data: { userId: string; username: string }) => {
      dispatch({ type: 'REMOVE_PARTICIPANT', payload: { userId: data.userId } });
      toast.info(`${data.username} left the room`);
    };

    const handleParticipantReconnected = (data: { userId: string; username: string }) => {
      dispatch({ type: 'PARTICIPANT_RECONNECTED', payload: { userId: data.userId } });
    };

    const handleRoleAssigned = (data: { userId: string; role: Role; assignedBy: string }) => {
      dispatch({ type: 'SET_ROLE', payload: { userId: data.userId, role: data.role } });
      const isMe = state.currentUser?.userId === data.userId;
      if (isMe) {
        toast.success(`You are now a ${data.role}`);
      } else {
        toast.info(`Role updated: ${data.role} (by ${data.assignedBy})`);
      }
    };

    const handleParticipantRemoved = (data: { userId: string; username: string; removedBy: string }) => {
      dispatch({ type: 'REMOVE_PARTICIPANT', payload: { userId: data.userId } });
      toast.error(`${data.username} was removed by ${data.removedBy}`);
    };

    const handleHostTransferred = (data: { newHostId: string; previousHostId: string }) => {
      dispatch({ type: 'SET_HOST', payload: data });
      const newHostName = state.participants.find((p) => p.userId === data.newHostId)?.username || 'Someone';
      toast.info(`Host status transferred to ${newHostName}`);
    };

    const handleRoomEnded = (data: { message: string }) => {
      toast.error(data.message || 'The watch party has ended.');
      if (state.room) {
        clearSession(state.room.roomCode);
      }
      dispatch({ type: 'RESET_ROOM' });
    };

    const handleControlRequestCreated = (request: ControlRequest) => {
      dispatch({ type: 'ADD_REQUEST', payload: request });
      toast.info(`${request.requesterName} requested: ${request.type}`);
    };

    const handleControlRequestResolved = (data: {
      requestId: string;
      decision: 'APPROVED' | 'REJECTED';
      resolvedBy: string;
    }) => {
      dispatch({ type: 'RESOLVE_REQUEST', payload: { requestId: data.requestId } });
      if (data.decision === 'APPROVED') {
        toast.success(`Request approved by ${data.resolvedBy}`);
      } else {
        toast.error(`Request rejected by ${data.resolvedBy}`);
      }
    };

    const handleMessageReceived = (msg: ChatMessage) => {
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: msg });
    };

    const handleError = (err: { code: string; message: string }) => {
      toast.error(err.message || 'An error occurred');
      if (err.code === 'REMOVED_FROM_ROOM') {
        if (state.room) clearSession(state.room.roomCode);
        dispatch({ type: 'RESET_ROOM' });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('room_created', handleRoomCreated);
    socket.on('room_joined', handleRoomJoined);
    socket.on('play', handlePlaybackUpdate);
    socket.on('pause', handlePlaybackUpdate);
    socket.on('seek', handlePlaybackUpdate);
    socket.on('video_changed', handlePlaybackUpdate);
    socket.on('sync_state', handlePlaybackUpdate);
    socket.on('participant_joined', handleParticipantJoined);
    socket.on('participant_left', handleParticipantLeft);
    socket.on('participant_reconnected', handleParticipantReconnected);
    socket.on('role_assigned', handleRoleAssigned);
    socket.on('participant_removed', handleParticipantRemoved);
    socket.on('host_transferred', handleHostTransferred);
    socket.on('room_ended', handleRoomEnded);
    socket.on('control_request_created', handleControlRequestCreated);
    socket.on('control_request_resolved', handleControlRequestResolved);
    socket.on('message_received', handleMessageReceived);
    socket.on('error', handleError);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('room_created', handleRoomCreated);
      socket.off('room_joined', handleRoomJoined);
      socket.off('play', handlePlaybackUpdate);
      socket.off('pause', handlePlaybackUpdate);
      socket.off('seek', handlePlaybackUpdate);
      socket.off('video_changed', handlePlaybackUpdate);
      socket.off('sync_state', handlePlaybackUpdate);
      socket.off('participant_joined', handleParticipantJoined);
      socket.off('participant_left', handleParticipantLeft);
      socket.off('participant_reconnected', handleParticipantReconnected);
      socket.off('role_assigned', handleRoleAssigned);
      socket.off('participant_removed', handleParticipantRemoved);
      socket.off('host_transferred', handleHostTransferred);
      socket.off('room_ended', handleRoomEnded);
      socket.off('control_request_created', handleControlRequestCreated);
      socket.off('control_request_resolved', handleControlRequestResolved);
      socket.off('message_received', handleMessageReceived);
      socket.off('error', handleError);
    };
  }, [state.room, state.currentUser, state.participants]);

  // Actions
  const createRoom = async (username: string, roomName?: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!socket.connected) socket.connect();

      socket.emit('create_room', { username, roomName: roomName || null }, (res) => {
        if (res.success && res.data) {
          dispatch({ type: 'SET_ROOM_DATA', payload: res.data });
          resolve(res.data.room.roomCode);
        } else {
          toast.error(res.error?.message || 'Failed to create room');
          resolve(null);
        }
      });
    });
  };

  const joinRoom = async (
    roomCode: string,
    username: string,
    sessionToken?: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!socket.connected) socket.connect();

      const existingToken = sessionToken || getSession(roomCode)?.sessionToken;

      socket.emit(
        'join_room',
        {
          roomCode,
          username,
          sessionToken: existingToken,
        },
        (res) => {
          if (res.success && res.data) {
            dispatch({ type: 'SET_ROOM_DATA', payload: res.data });
            resolve(true);
          } else {
            toast.error(res.error?.message || 'Failed to join room');
            resolve(false);
          }
        }
      );
    });
  };

  const leaveRoom = () => {
    if (state.room) {
      socket.emit('leave_room');
      clearSession(state.room.roomCode);
      dispatch({ type: 'RESET_ROOM' });
    }
  };

  const sendPlay = (time: number) => {
    socket.emit('play', { time });
  };

  const sendPause = (time: number) => {
    socket.emit('pause', { time });
  };

  const sendSeek = (time: number) => {
    socket.emit('seek', { time });
  };

  const sendChangeVideo = (videoId: string) => {
    socket.emit('change_video', { videoId });
  };

  const sendAssignRole = (targetUserId: string, role: 'MODERATOR' | 'PARTICIPANT') => {
    socket.emit('assign_role', { targetUserId, role });
  };

  const sendRemoveParticipant = (targetUserId: string) => {
    socket.emit('remove_participant', { targetUserId });
  };

  const sendTransferHost = (targetUserId: string) => {
    socket.emit('transfer_host', { targetUserId });
  };

  const sendEndRoom = () => {
    socket.emit('end_room');
  };

  const sendRequestControl = (type: ControlRequest['type'], payload?: ControlRequest['payload']) => {
    socket.emit('request_control', { type, payload });
    toast.success(`${type} control request sent to host`);
  };

  const sendResolveControlRequest = (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
    socket.emit('resolve_control_request', { requestId, decision });
  };

  const sendChatMessage = (content: string) => {
    socket.emit('send_message', { content });
  };

  const resync = () => {
    socket.emit('request_sync');
    toast.info('Synchronizing with host...');
  };

  return (
    <RoomContext.Provider
      value={{
        state,
        dispatch,
        createRoom,
        joinRoom,
        leaveRoom,
        sendPlay,
        sendPause,
        sendSeek,
        sendChangeVideo,
        sendAssignRole,
        sendRemoveParticipant,
        sendTransferHost,
        sendEndRoom,
        sendRequestControl,
        sendResolveControlRequest,
        sendChatMessage,
        resync,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
