import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { serverRoutes } from './routes/server.js';
import { logsRoutes } from './routes/logs.js';
import { playersRoutes } from './routes/players.js';
import { propertiesRoutes } from './routes/properties.js';
import { backupRoutes } from './routes/backup.js';
import { resourcesRoutes } from './routes/resources.js';
import { modsRoutes } from './routes/mods.js';
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
app.use('/api/properties', propertiesRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/mods', modsRoutes);

// Health check (no auth required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from client build (production)
// When running from server/dist, client is at ../client/dist relative to server root
const clientDistPath = path.resolve(process.cwd(), '../client/dist');
app.use(express.static(clientDistPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (_req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <html>
          <head><title>MC Dashboard</title></head>
          <body style="background:#1a1a2e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="text-align:center;">
              <h1>MC Dashboard API</h1>
              <p>Frontend not found. Run <code>npm run build</code> in the client directory.</p>
              <p><a href="/health" style="color:#5D8C3E;">/health</a></p>
            </div>
          </body>
        </html>
      `);
    }
  });
});

// WebSocket for real-time logs
setupLogStreaming(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
