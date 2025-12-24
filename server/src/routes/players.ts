import { Router, Request, Response } from 'express';
import { playerTracker } from '../services/playerTracker.js';
import { minecraftServer } from '../services/minecraftServer.js';

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

// Player management actions
playersRoutes.post('/kick', (req: Request, res: Response) => {
  const { player, reason } = req.body;

  if (!player) {
    res.status(400).json({ error: 'Player name is required' });
    return;
  }

  try {
    const command = reason ? `kick ${player} ${reason}` : `kick ${player}`;
    minecraftServer.sendCommand(command);
    res.json({ success: true, message: `Kicked ${player}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

playersRoutes.post('/ban', (req: Request, res: Response) => {
  const { player, reason } = req.body;

  if (!player) {
    res.status(400).json({ error: 'Player name is required' });
    return;
  }

  try {
    const command = reason ? `ban ${player} ${reason}` : `ban ${player}`;
    minecraftServer.sendCommand(command);
    res.json({ success: true, message: `Banned ${player}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

playersRoutes.post('/unban', (req: Request, res: Response) => {
  const { player } = req.body;

  if (!player) {
    res.status(400).json({ error: 'Player name is required' });
    return;
  }

  try {
    minecraftServer.sendCommand(`pardon ${player}`);
    res.json({ success: true, message: `Unbanned ${player}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

playersRoutes.post('/whitelist/add', (req: Request, res: Response) => {
  const { player } = req.body;

  if (!player) {
    res.status(400).json({ error: 'Player name is required' });
    return;
  }

  try {
    minecraftServer.sendCommand(`whitelist add ${player}`);
    res.json({ success: true, message: `Added ${player} to whitelist` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

playersRoutes.post('/whitelist/remove', (req: Request, res: Response) => {
  const { player } = req.body;

  if (!player) {
    res.status(400).json({ error: 'Player name is required' });
    return;
  }

  try {
    minecraftServer.sendCommand(`whitelist remove ${player}`);
    res.json({ success: true, message: `Removed ${player} from whitelist` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

playersRoutes.post('/op', (req: Request, res: Response) => {
  const { player } = req.body;

  if (!player) {
    res.status(400).json({ error: 'Player name is required' });
    return;
  }

  try {
    minecraftServer.sendCommand(`op ${player}`);
    res.json({ success: true, message: `Made ${player} an operator` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

playersRoutes.post('/deop', (req: Request, res: Response) => {
  const { player } = req.body;

  if (!player) {
    res.status(400).json({ error: 'Player name is required' });
    return;
  }

  try {
    minecraftServer.sendCommand(`deop ${player}`);
    res.json({ success: true, message: `Removed ${player} as operator` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});
