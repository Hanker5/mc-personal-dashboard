import { Router, Request, Response } from 'express';
import {
  listBackups,
  createBackup,
  restoreBackup,
  deleteBackup,
  formatBytes,
} from '../services/backupManager.js';

export const backupRoutes = Router();

backupRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const backups = await listBackups();
    const formatted = backups.map((b) => ({
      ...b,
      sizeFormatted: formatBytes(b.size),
    }));
    res.json({ backups: formatted });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

backupRoutes.post('/', async (req: Request, res: Response) => {
  const { worldName } = req.body;

  try {
    const backupName = await createBackup(worldName);
    res.json({ success: true, backupName, message: `Backup created: ${backupName}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

backupRoutes.post('/restore', async (req: Request, res: Response) => {
  const { backupName } = req.body;

  if (!backupName) {
    res.status(400).json({ error: 'Backup name is required' });
    return;
  }

  try {
    await restoreBackup(backupName);
    res.json({ success: true, message: `Backup restored: ${backupName}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

backupRoutes.delete('/:name', async (req: Request, res: Response) => {
  const { name } = req.params;

  try {
    await deleteBackup(name);
    res.json({ success: true, message: `Backup deleted: ${name}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});
