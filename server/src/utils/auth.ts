import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip auth for CORS preflight requests
  if (req.method === 'OPTIONS') {
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Authorization header required' });
    return;
  }

  const [scheme, credentials] = authHeader.split(' ');

  if (scheme !== 'Basic' || !credentials) {
    res.status(401).json({ error: 'Invalid authorization scheme' });
    return;
  }

  const decoded = Buffer.from(credentials, 'base64').toString('utf-8');
  const [username, password] = decoded.split(':');

  const expectedUsername = process.env.AUTH_USERNAME || 'admin';
  const expectedPassword = process.env.AUTH_PASSWORD || 'changeme';

  if (username !== expectedUsername || password !== expectedPassword) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  next();
}
