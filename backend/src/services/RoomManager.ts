import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { Role } from '@watchparty/shared';
import { Participant } from '../models/Participant';
import { Room } from '../models/Room';
import { generateRoomCode } from '../utils/roomCode';
import { generateSessionToken, hashToken } from '../utils/token';

export class RoomManager {
  private prisma: PrismaClient;
  private roomsByCode = new Map<string, Room>();
  private roomsById = new Map<string, Room>();
  private socketToUser = new Map<string, { roomId: string; userId: string }>();

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Initializes RoomManager and rehydrates active rooms from database.
   */
  public async init(): Promise<void> {
    try {
      const dbRooms = await this.prisma.room.findMany({
        where: { status: 'ACTIVE' },
        include: { participants: true },
      });

      for (const dbRoom of dbRooms) {
        const room = new Room({
          id: dbRoom.id,
          roomCode: dbRoom.code,
          name: dbRoom.name,
          hostId: dbRoom.hostId,
          currentVideoId: dbRoom.currentVideoId,
          createdAt: dbRoom.createdAt.getTime(),
        });

        for (const p of dbRoom.participants) {
          if (!p.removedAt) {
            const participant = new Participant({
              userId: p.id,
              username: p.username,
              role: p.role as Role,
              sessionTokenHash: p.sessionTokenHash,
              joinedAt: p.joinedAt.getTime(),
              isConnected: false, // Disconnected until they re-join with socket
            });
            room.addParticipant(participant);
          }
        }

        this.roomsByCode.set(room.roomCode, room);
        this.roomsById.set(room.id, room);
      }
      console.log(`[RoomManager] Rehydrated ${dbRooms.length} active rooms from DB`);
    } catch (err) {
      console.error('[RoomManager] Failed to rehydrate rooms from DB:', err);
    }
  }

  /**
   * Creates a new Room with an unambiguous unique code and sets creator as HOST.
   */
  public async createRoom(
    username: string,
    roomName?: string | null
  ): Promise<{ room: Room; participant: Participant; sessionToken: string }> {
    let roomCode = generateRoomCode();
    let attempts = 0;

    // Retry on collision
    while ((this.roomsByCode.has(roomCode) || (await this.prisma.room.findUnique({ where: { code: roomCode } }))) && attempts < 10) {
      roomCode = generateRoomCode();
      attempts++;
    }

    const roomId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const sessionToken = generateSessionToken();
    const sessionTokenHash = hashToken(sessionToken);

    // Create persistent record
    await this.prisma.room.create({
      data: {
        id: roomId,
        code: roomCode,
        name: roomName ?? null,
        hostId: userId,
        status: 'ACTIVE',
        participants: {
          create: {
            id: userId,
            username: username.trim(),
            role: 'HOST',
            sessionTokenHash,
          },
        },
      },
    });

    const room = new Room({
      id: roomId,
      roomCode,
      name: roomName ?? null,
      hostId: userId,
    });

    const participant = new Participant({
      userId,
      username: username.trim(),
      role: 'HOST',
      sessionTokenHash,
      isConnected: true,
    });

    room.addParticipant(participant);

    this.roomsByCode.set(roomCode, room);
    this.roomsById.set(roomId, room);

    return { room, participant, sessionToken };
  }

  /**
   * Gets an active room by code (in-memory first, DB fallback).
   */
  public async getRoom(roomCode: string): Promise<Room | null> {
    const memoryRoom = this.roomsByCode.get(roomCode);
    if (memoryRoom && memoryRoom.status === 'ACTIVE') {
      return memoryRoom;
    }

    // Check DB if not loaded in memory
    const dbRoom = await this.prisma.room.findUnique({
      where: { code: roomCode },
      include: { participants: true },
    });

    if (!dbRoom || dbRoom.status !== 'ACTIVE') {
      return null;
    }

    const room = new Room({
      id: dbRoom.id,
      roomCode: dbRoom.code,
      name: dbRoom.name,
      hostId: dbRoom.hostId,
      currentVideoId: dbRoom.currentVideoId,
      createdAt: dbRoom.createdAt.getTime(),
    });

    for (const p of dbRoom.participants) {
      if (!p.removedAt) {
        const participant = new Participant({
          userId: p.id,
          username: p.username,
          role: p.role as Role,
          sessionTokenHash: p.sessionTokenHash,
          joinedAt: p.joinedAt.getTime(),
          isConnected: false,
        });
        room.addParticipant(participant);
      }
    }

    this.roomsByCode.set(room.roomCode, room);
    this.roomsById.set(room.id, room);
    return room;
  }

  /**
   * Joins a room as a participant or reconnects existing participant with valid token.
   */
  public async joinRoom(
    roomCode: string,
    username: string,
    sessionToken?: string,
    socketId?: string
  ): Promise<{ room: Room; participant: Participant; sessionToken: string; isReconnect: boolean }> {
    const room = await this.getRoom(roomCode);
    if (!room || room.status !== 'ACTIVE') {
      throw new Error('ROOM_NOT_FOUND');
    }

    // Attempt reconnection if session token provided
    if (sessionToken) {
      const tokenHash = hashToken(sessionToken);
      const existingParticipant = room.getParticipantByTokenHash(tokenHash);

      if (existingParticipant) {
        // Reconnection matched
        if (socketId) {
          existingParticipant.setConnected(socketId);
          this.socketToUser.set(socketId, { roomId: room.id, userId: existingParticipant.userId });
        }
        return {
          room,
          participant: existingParticipant,
          sessionToken,
          isReconnect: true,
        };
      }
    }

    // Check unique username within room
    if (room.isUsernameTaken(username)) {
      throw new Error('USERNAME_TAKEN');
    }

    // Create brand new Participant
    const userId = crypto.randomUUID();
    const newSessionToken = generateSessionToken();
    const tokenHash = hashToken(newSessionToken);

    // Persist to DB
    await this.prisma.participant.create({
      data: {
        id: userId,
        roomId: room.id,
        username: username.trim(),
        role: 'PARTICIPANT',
        sessionTokenHash: tokenHash,
      },
    });

    const participant = new Participant({
      userId,
      username: username.trim(),
      role: 'PARTICIPANT',
      sessionTokenHash: tokenHash,
      socketId,
      isConnected: Boolean(socketId),
    });

    room.addParticipant(participant);

    if (socketId) {
      this.socketToUser.set(socketId, { roomId: room.id, userId });
    }

    return {
      room,
      participant,
      sessionToken: newSessionToken,
      isReconnect: false,
    };
  }

  /**
   * Resolves room and participant by socket ID.
   */
  public findRoomBySocket(socketId: string): { room: Room; participant: Participant } | null {
    const mapping = this.socketToUser.get(socketId);
    if (!mapping) return null;

    const room = this.roomsById.get(mapping.roomId);
    if (!room || room.status !== 'ACTIVE') return null;

    const participant = room.getParticipant(mapping.userId);
    if (!participant) return null;

    return { room, participant };
  }

  /**
   * Registers a socket connection for a user.
   */
  public registerSocket(socketId: string, roomId: string, userId: string): void {
    this.socketToUser.set(socketId, { roomId, userId });
  }

  /**
   * Handles socket disconnect with a 60-second grace period.
   */
  public handleSocketDisconnect(socketId: string): { room: Room; participant: Participant } | null {
    const resolved = this.findRoomBySocket(socketId);
    this.socketToUser.delete(socketId);

    if (resolved) {
      resolved.participant.setDisconnected();
      return resolved;
    }
    return null;
  }

  /**
   * Explicit leave: transfer host if Host leaves, or close room if empty.
   */
  public async leaveRoom(
    socketId: string
  ): Promise<{ room: Room; participant: Participant; hostChanged?: boolean; roomClosed?: boolean } | null> {
    const resolved = this.findRoomBySocket(socketId);
    if (!resolved) return null;

    const { room, participant } = resolved;
    this.socketToUser.delete(socketId);
    room.removeParticipant(participant.userId);

    // Update DB leftAt
    await this.prisma.participant.updateMany({
      where: { id: participant.userId, roomId: room.id },
      data: { leftAt: new Date() },
    });

    // Check if room is empty
    if (room.participants.size === 0) {
      room.close();
      await this.prisma.room.update({
        where: { id: room.id },
        data: { status: 'CLOSED', closedAt: new Date() },
      });
      return { room, participant, roomClosed: true };
    }

    let hostChanged = false;
    // If the leaving user was the Host, reassign Host
    if (room.hostId === participant.userId) {
      // Find earliest joined Moderator first
      const participantsList = Array.from(room.participants.values()).sort(
        (a, b) => a.joinedAt - b.joinedAt
      );

      const nextHost =
        participantsList.find((p) => p.role === 'MODERATOR') || participantsList[0];

      if (nextHost) {
        room.transferHost(nextHost.userId);
        hostChanged = true;

        await this.prisma.room.update({
          where: { id: room.id },
          data: { hostId: nextHost.userId },
        });

        await this.prisma.participant.update({
          where: { id: nextHost.userId },
          data: { role: 'HOST' },
        });
      }
    }

    return { room, participant, hostChanged };
  }

  /**
   * Closes a room completely (by Host or cleanup).
   */
  public async closeRoom(roomCode: string): Promise<boolean> {
    const room = this.roomsByCode.get(roomCode);
    if (!room) return false;

    room.close();
    await this.prisma.room.update({
      where: { id: room.id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });

    this.roomsByCode.delete(roomCode);
    this.roomsById.delete(room.id);
    return true;
  }

  /**
   * Persists video change to database.
   */
  public async persistVideoChange(roomId: string, videoId: string): Promise<void> {
    try {
      await this.prisma.room.update({
        where: { id: roomId },
        data: { currentVideoId: videoId },
      });
    } catch (err) {
      console.error('[RoomManager] Failed to persist video change:', err);
    }
  }

  /**
   * Persists participant role change.
   */
  public async persistRoleChange(userId: string, role: Role): Promise<void> {
    try {
      await this.prisma.participant.update({
        where: { id: userId },
        data: { role },
      });
    } catch (err) {
      console.error('[RoomManager] Failed to persist role change:', err);
    }
  }

  /**
   * Marks participant removed in DB.
   */
  public async persistParticipantRemoval(userId: string): Promise<void> {
    try {
      await this.prisma.participant.update({
        where: { id: userId },
        data: { removedAt: new Date() },
      });
    } catch (err) {
      console.error('[RoomManager] Failed to persist participant removal:', err);
    }
  }

  /**
   * Periodically cleans up rooms that have had 0 connected participants for > 10 minutes.
   */
  public async cleanupInactiveRooms(): Promise<void> {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;

    for (const [code, room] of this.roomsByCode.entries()) {
      if (room.status !== 'ACTIVE') continue;

      const connected = room.getConnectedCount();
      if (connected === 0) {
        // Find latest disconnect
        let latestActivity = room.createdAt;
        for (const p of room.participants.values()) {
          if (p.lastDisconnectedAt && p.lastDisconnectedAt > latestActivity) {
            latestActivity = p.lastDisconnectedAt;
          }
        }

        if (now - latestActivity > tenMinutes) {
          console.log(`[RoomManager] Cleaning up inactive room: ${code}`);
          await this.closeRoom(code);
        }
      }
    }
  }
}
