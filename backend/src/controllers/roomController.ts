import { Request, Response, NextFunction } from 'express';
import { CreateRoomRestSchema, RoomCodeSchema } from '@watchparty/shared';
import { RoomManager } from '../services/RoomManager';
import { normalizeRoomCode } from '../utils/roomCode';

export class RoomController {
  constructor(private roomManager: RoomManager) {}

  public createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, roomName } = CreateRoomRestSchema.parse(req.body);
      const result = await this.roomManager.createRoom(username, roomName);

      res.status(201).json({
        roomCode: result.room.roomCode,
        userId: result.participant.userId,
        sessionToken: result.sessionToken,
        roomName: result.room.name,
      });
    } catch (err) {
      next(err);
    }
  };

  public checkRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramCode = req.params.roomCode;
      const rawCode = Array.isArray(paramCode) ? paramCode[0] : paramCode || '';
      const normalizedCode = normalizeRoomCode(rawCode);

      const parsedCode = RoomCodeSchema.safeParse(normalizedCode);
      if (!parsedCode.success) {
        res.status(200).json({ exists: false });
        return;
      }

      const room = await this.roomManager.getRoom(normalizedCode);
      if (!room || room.status !== 'ACTIVE') {
        res.status(200).json({ exists: false });
        return;
      }

      res.status(200).json({
        exists: true,
        status: room.status,
        roomName: room.name,
      });
    } catch (err) {
      next(err);
    }
  };
}
