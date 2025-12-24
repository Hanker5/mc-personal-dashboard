import { Router, Request, Response } from 'express';
import { minecraftServer } from '../services/minecraftServer.js';

export const serverRoutes = Router();

serverRoutes.get('/status', (_req: Request, res: Response) => {
  const status = minecraftServer.getStatus();
  res.json(status);
});

serverRoutes.post('/start', async (_req: Request, res: Response) => {
  try {
    await minecraftServer.start();
    res.json({ success: true, message: 'Server starting...' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});

serverRoutes.post('/stop', async (_req: Request, res: Response) => {
  try {
    await minecraftServer.stop();
    res.json({ success: true, message: 'Server stopped' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});

serverRoutes.post('/restart', async (_req: Request, res: Response) => {
  try {
    await minecraftServer.restart();
    res.json({ success: true, message: 'Server restarting...' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});

serverRoutes.post('/command', (req: Request, res: Response) => {
  const { command } = req.body;

  if (!command || typeof command !== 'string') {
    res.status(400).json({ error: 'Command is required' });
    return;
  }

  try {
    minecraftServer.sendCommand(command);
    res.json({ success: true, message: `Command sent: ${command}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});
