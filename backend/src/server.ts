import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { RoomManager } from './services/RoomManager';
import { RoomController } from './controllers/roomController';
import { AuthController } from './controllers/authController';
import { setupWebSocket } from './websocket';
import { errorHandler } from './middleware/errorHandler';

async function bootstrap() {
  const app = express();
  const server = http.createServer(app);

  // Security Middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  const cleanClientUrl = env.CLIENT_URL.replace(/\/+$/, '');
  const allowedOrigins = [
    cleanClientUrl,
    `${cleanClientUrl}/`,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          origin.endsWith('.onrender.com') ||
          env.NODE_ENV === 'development' ||
          env.CLIENT_URL === '*'
        ) {
          callback(null, true);
        } else {
          callback(new Error(`Blocked by CORS: ${origin}`));
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '100kb' }));

  // Global REST Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } },
  });
  app.use('/api', apiLimiter);

  // Create Room rate limiter specifically to prevent room spam
  const createRoomLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many room creations. Please wait.' } },
  });

  // Services and Controllers
  const roomManager = new RoomManager();
  await roomManager.init();

  const roomController = new RoomController(roomManager);
  const authController = new AuthController();

  // Health Endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: Date.now() });
  });

  // REST API Endpoints
  app.post('/api/rooms', createRoomLimiter, roomController.createRoom);
  app.get('/api/rooms/:roomCode', roomController.checkRoom);

  // User Authentication & Profile REST Endpoints (Strict DB backed)
  app.post('/api/auth/register', authController.register);
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/google', authController.googleLogin);
  app.put('/api/auth/profile', authController.updateProfile);
  app.post('/api/auth/rooms/created', authController.addCreatedRoom);
  app.post('/api/auth/rooms/joined', authController.addJoinedRoom);
  app.delete('/api/auth/rooms/created/:userId/:code', authController.removeCreatedRoom);
  app.delete('/api/auth/rooms/joined/:userId/:code', authController.removeJoinedRoom);
  app.delete('/api/auth/rooms/joined-all/:userId', authController.clearJoinedHistory);

  // Global Error Handler
  app.use(errorHandler);

  // WebSocket Server Setup
  const io = setupWebSocket(server, roomManager, env.CLIENT_URL);

  server.listen(env.PORT, '0.0.0.0', () => {
    console.log(`🚀 WatchParty Server running on http://0.0.0.0:${env.PORT}`);
    console.log(`📡 WebSocket ready. Environment: ${env.NODE_ENV}`);
  });

  // Graceful shutdown
  const gracefulShutdown = () => {
    console.log('\n🛑 Gracefully shutting down WatchParty Server...');
    io.close(() => {
      server.close(() => {
        console.log('💤 Server terminated.');
        process.exit(0);
      });
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

bootstrap().catch((err) => {
  console.error('❌ Fatal startup error:', err);
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
});
