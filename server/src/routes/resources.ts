import { Router, Request, Response } from 'express';
import { getResourceStats, formatBytes, formatUptime } from '../services/resourceMonitor.js';

export const resourcesRoutes = Router();

resourcesRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const stats = await getResourceStats();
    res.json({
      ...stats,
      memory: {
        ...stats.memory,
        totalFormatted: formatBytes(stats.memory.total),
        usedFormatted: formatBytes(stats.memory.used),
        freeFormatted: formatBytes(stats.memory.free),
      },
      disk: {
        ...stats.disk,
        totalFormatted: formatBytes(stats.disk.total),
        usedFormatted: formatBytes(stats.disk.used),
        freeFormatted: formatBytes(stats.disk.free),
      },
      uptimeFormatted: formatUptime(stats.uptime),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});
