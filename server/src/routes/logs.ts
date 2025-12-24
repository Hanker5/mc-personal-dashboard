import { Router, Request, Response } from 'express';
import fs from 'fs';
import { config } from '../utils/config.js';

export const logsRoutes = Router();

logsRoutes.get('/', async (req: Request, res: Response) => {
  const lines = parseInt(req.query.lines as string) || 100;
  const logPath = config.minecraft.logPath;

  try {
    if (!fs.existsSync(logPath)) {
      res.json({ logs: [], message: 'Log file not found' });
      return;
    }

    const content = await fs.promises.readFile(logPath, 'utf-8');
    const allLines = content.split('\n').filter(Boolean);
    const recentLines = allLines.slice(-lines);

    res.json({
      logs: recentLines,
      total: allLines.length,
      returned: recentLines.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

logsRoutes.get('/files', async (_req: Request, res: Response) => {
  const logsDir = `${config.minecraft.serverPath}/logs`;

  try {
    if (!fs.existsSync(logsDir)) {
      res.json({ files: [] });
      return;
    }

    const files = await fs.promises.readdir(logsDir);
    const logFiles = files
      .filter((f) => f.endsWith('.log') || f.endsWith('.log.gz'))
      .map((f) => ({
        name: f,
        path: `${logsDir}/${f}`,
      }));

    res.json({ files: logFiles });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});
