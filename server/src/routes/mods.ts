import { Router, Request, Response } from 'express';
import { listMods, formatBytes } from '../services/modsManager.js';

export const modsRoutes = Router();

modsRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const mods = await listMods();
    const formatted = mods.map((mod) => ({
      ...mod,
      sizeFormatted: formatBytes(mod.size),
    }));

    res.json({
      count: mods.length,
      mods: formatted,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});
