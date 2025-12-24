import { Router, Request, Response } from 'express';
import { playerTracker } from '../services/playerTracker.js';

export const playersRoutes = Router();

playersRoutes.get('/', (_req: Request, res: Response) => {
  const players = playerTracker.getOnlinePlayers();
  res.json({
    count: players.length,
    players,
  });
});

playersRoutes.get('/history', (_req: Request, res: Response) => {
  const history = playerTracker.getPlayerHistory();
  res.json({ history });
});

playersRoutes.get('/operators', async (_req: Request, res: Response) => {
  const operators = await playerTracker.getOperators();
  res.json({ operators });
});

playersRoutes.get('/whitelist', async (_req: Request, res: Response) => {
  const whitelist = await playerTracker.getWhitelist();
  res.json({ whitelist });
});
