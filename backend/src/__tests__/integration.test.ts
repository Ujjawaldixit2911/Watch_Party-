import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import express from 'express';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@watchparty/shared';
import { RoomManager } from '../services/RoomManager';
import { setupWebSocket } from '../websocket';

describe('Socket.IO Integration Tests', () => {
  let server: http.Server;
  let serverPort: number;
  let roomManager: RoomManager;

  let hostSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents>;
  let viewerSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents>;
  let roomCode: string;

  beforeAll(async () => {
    const app = express();
    server = http.createServer(app);
    roomManager = new RoomManager();
    setupWebSocket(server, roomManager, '*');

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address() as any;
        serverPort = address.port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (hostSocket?.connected) hostSocket.disconnect();
    if (viewerSocket?.connected) viewerSocket.disconnect();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('allows user to create a room and become Host', async () => {
    hostSocket = Client(`http://localhost:${serverPort}`, {
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      hostSocket.on('connect', () => {
        hostSocket.emit(
          'create_room',
          { username: 'AliceHost', roomName: 'Test Room' },
          (res) => {
            expect(res.success).toBe(true);
            expect(res.data?.currentUser.role).toBe('HOST');
            expect(res.data?.room.roomCode).toBeDefined();
            roomCode = res.data!.room.roomCode;
            resolve();
          }
        );
      });
      hostSocket.on('connect_error', reject);
    });
  });

  it('allows second user to join as Participant and receive initial state', async () => {
    viewerSocket = Client(`http://localhost:${serverPort}`, {
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      viewerSocket.on('connect', () => {
        viewerSocket.emit(
          'join_room',
          { roomCode, username: 'BobViewer' },
          (res) => {
            expect(res.success).toBe(true);
            expect(res.data?.currentUser.role).toBe('PARTICIPANT');
            expect(res.data?.playback.state).toBe('PAUSED');
            resolve();
          }
        );
      });
      viewerSocket.on('connect_error', reject);
    });
  });

  it('rejects Participant attempting direct playback control', async () => {
    await new Promise<void>((resolve) => {
      viewerSocket.once('error', (err) => {
        expect(err.code).toBe('UNAUTHORIZED');
        resolve();
      });
      viewerSocket.emit('play', { time: 10 });
    });
  });

  it('broadcasts playback to all participants when Host plays', async () => {
    const playReceivedPromise = new Promise<void>((resolve) => {
      viewerSocket.once('play', (snapshot) => {
        expect(snapshot.state).toBe('PLAYING');
        expect(snapshot.time).toBe(15);
        resolve();
      });
    });

    hostSocket.emit('play', { time: 15 });
    await playReceivedPromise;
  });

  it('allows Host to promote Participant to Moderator', async () => {
    const targetUserId = roomManager.findRoomBySocket(viewerSocket.id!)?.participant.userId!;

    const roleAssignedPromise = new Promise<void>((resolve) => {
      viewerSocket.once('role_assigned', (data) => {
        expect(data.userId).toBe(targetUserId);
        expect(data.role).toBe('MODERATOR');
        resolve();
      });
    });

    hostSocket.emit('assign_role', { targetUserId, role: 'MODERATOR' });
    await roleAssignedPromise;
  });

  it('allows Moderator to seek video playback', async () => {
    const seekPromise = new Promise<void>((resolve) => {
      hostSocket.once('seek', (snapshot) => {
        expect(snapshot.time).toBe(60);
        resolve();
      });
    });

    viewerSocket.emit('seek', { time: 60 });
    await seekPromise;
  });
});
