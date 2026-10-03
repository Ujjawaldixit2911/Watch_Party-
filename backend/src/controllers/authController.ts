import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_watchparty_salt_v1').digest('hex');
}

export class AuthController {
  /**
   * Register a brand new user
   */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      if (!cleanName || cleanName.length < 2) {
        res.status(400).json({ error: { message: 'Name must be at least 2 characters.' } });
        return;
      }

      if (!cleanEmail || !cleanEmail.includes('@')) {
        res.status(400).json({ error: { message: 'Please provide a valid email address.' } });
        return;
      }

      if (!cleanPass || cleanPass.length < 4) {
        res.status(400).json({ error: { message: 'Password must be at least 4 characters.' } });
        return;
      }

      // Check if user exists
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existing) {
        res.status(400).json({
          error: { message: 'An account with this email already exists. Please log in.' },
        });
        return;
      }

      const passwordHash = hashPassword(cleanPass);
      const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`;

      const newUser = await prisma.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          passwordHash,
          avatar: defaultAvatar,
          bio: 'New WatchParty Member ✨ Ready for sync music & stream parties.',
          favoriteGenre: 'Pop & EDM',
        },
        include: {
          createdRooms: { orderBy: { createdAt: 'desc' } },
          joinedRooms: { orderBy: { joinedAt: 'desc' } },
        },
      });

      res.status(201).json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          bio: newUser.bio,
          favoriteGenre: newUser.favoriteGenre,
          createdAt: newUser.createdAt.getTime(),
          roomsHosted: 0,
          watchTimeMinutes: 0,
          createdRooms: [],
          joinedRooms: [],
        },
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Strict Login - Verifies account existence in SQLite database
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        res.status(400).json({ error: { message: 'Please provide a valid email address.' } });
        return;
      }

      if (!cleanPass) {
        res.status(400).json({ error: { message: 'Password is required.' } });
        return;
      }

      // Find user in database
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: {
          createdRooms: { orderBy: { createdAt: 'desc' } },
          joinedRooms: { orderBy: { joinedAt: 'desc' } },
        },
      });

      if (!user) {
        res.status(404).json({
          error: {
            message: 'No account found with this email. Please create an account first!',
          },
        });
        return;
      }

      const expectedHash = hashPassword(cleanPass);
      if (user.passwordHash !== expectedHash) {
        res.status(401).json({
          error: {
            message: 'Incorrect password. Please verify your credentials.',
          },
        });
        return;
      }

      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          favoriteGenre: user.favoriteGenre,
          createdAt: user.createdAt.getTime(),
          roomsHosted: user.createdRooms.length,
          watchTimeMinutes: 60,
          createdRooms: user.createdRooms.map((r) => ({
            code: r.code,
            name: r.name,
            createdAt: r.createdAt.getTime(),
          })),
          joinedRooms: user.joinedRooms.map((r) => ({
            code: r.code,
            name: r.name,
            joinedAt: r.joinedAt.getTime(),
            hostName: r.hostName || undefined,
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Update Profile Details and Avatar Photo
   */
  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, name, bio, favoriteGenre, avatar } = req.body;

      if (!userId) {
        res.status(400).json({ error: { message: 'User ID is required.' } });
        return;
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name ? name.trim() : undefined,
          bio: bio !== undefined ? bio.trim() : undefined,
          favoriteGenre: favoriteGenre !== undefined ? favoriteGenre.trim() : undefined,
          avatar: avatar !== undefined ? avatar.trim() : undefined,
        },
      });

      res.status(200).json({
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          avatar: updated.avatar,
          bio: updated.bio,
          favoriteGenre: updated.favoriteGenre,
          createdAt: updated.createdAt.getTime(),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Add a created room specifically for this user
   */
  public addCreatedRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, code, name } = req.body;
      if (!userId || !code) {
        res.status(400).json({ error: { message: 'User ID and Room Code are required.' } });
        return;
      }

      const cleanCode = code.trim().toUpperCase();
      const roomName = (name || 'Watch Party Room').trim();

      // Check if already in user's created rooms
      const existing = await prisma.userCreatedRoom.findFirst({
        where: { userId, code: cleanCode },
      });

      if (!existing) {
        await prisma.userCreatedRoom.create({
          data: {
            userId,
            code: cleanCode,
            name: roomName,
          },
        });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Add a room to user's joined history
   */
  public addJoinedRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, code, name, hostName } = req.body;
      if (!userId || !code) {
        res.status(400).json({ error: { message: 'User ID and Room Code are required.' } });
        return;
      }

      const cleanCode = code.trim().toUpperCase();
      const roomName = (name || 'Watch Party Room').trim();

      // Delete older duplicate entry if present so new one is at top
      await prisma.userJoinedRoom.deleteMany({
        where: { userId, code: cleanCode },
      });

      await prisma.userJoinedRoom.create({
        data: {
          userId,
          code: cleanCode,
          name: roomName,
          hostName: hostName || null,
        },
      });

      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Remove created room for user
   */
  public removeCreatedRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = String(req.params.userId || '');
      const code = String(req.params.code || '').toUpperCase();
      if (!userId || !code) {
        res.status(400).json({ error: { message: 'User ID and code required' } });
        return;
      }

      await prisma.userCreatedRoom.deleteMany({
        where: { userId, code },
      });
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Remove joined room from history
   */
  public removeJoinedRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = String(req.params.userId || '');
      const code = String(req.params.code || '').toUpperCase();
      if (!userId || !code) {
        res.status(400).json({ error: { message: 'User ID and code required' } });
        return;
      }

      await prisma.userJoinedRoom.deleteMany({
        where: { userId, code },
      });
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Clear all joined room history
   */
  public clearJoinedHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = String(req.params.userId || '');
      if (!userId) {
        res.status(400).json({ error: { message: 'User ID required' } });
        return;
      }

      await prisma.userJoinedRoom.deleteMany({
        where: { userId },
      });
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };
}
