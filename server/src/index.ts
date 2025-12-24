import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { serverRoutes } from './routes/server.js';
import { logsRoutes } from './routes/logs.js';
import { playersRoutes } from './routes/players.js';
import { authMiddleware } from './utils/auth.js';
import { setupLogStreaming } from './services/logStreamer.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', authMiddleware);

// Routes
app.use('/api/server', serverRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/players', playersRoutes);

// Health check (no auth required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket for real-time logs
setupLogStreaming(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
