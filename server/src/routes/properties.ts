import { Router, Request, Response } from 'express';
import {
  getServerProperties,
  updateServerProperties,
  propertyDescriptions,
} from '../services/propertiesManager.js';

export const propertiesRoutes = Router();

propertiesRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const properties = await getServerProperties();
    res.json({ properties, descriptions: propertyDescriptions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

propertiesRoutes.put('/', async (req: Request, res: Response) => {
  const { properties } = req.body;

  if (!properties || typeof properties !== 'object') {
    res.status(400).json({ error: 'Properties object is required' });
    return;
  }

  try {
    await updateServerProperties(properties);
    res.json({ success: true, message: 'Properties updated. Restart server to apply changes.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});
