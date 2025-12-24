import fs from 'fs';
import path from 'path';
import { config } from '../utils/config.js';

interface ServerProperties {
  [key: string]: string;
}

export async function getServerProperties(): Promise<ServerProperties> {
  const propsPath = path.join(config.minecraft.serverPath, 'server.properties');

  try {
    const content = await fs.promises.readFile(propsPath, 'utf-8');
    const properties: ServerProperties = {};

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          properties[key.trim()] = valueParts.join('=').trim();
        }
      }
    }

    return properties;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

export async function updateServerProperties(
  updates: ServerProperties
): Promise<void> {
  const propsPath = path.join(config.minecraft.serverPath, 'server.properties');

  let content: string;
  try {
    content = await fs.promises.readFile(propsPath, 'utf-8');
  } catch {
    content = '';
  }

  const lines = content.split('\n');
  const updatedKeys = new Set<string>();

  // Update existing properties
  const newLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return line;
    }

    const [key] = trimmed.split('=');
    if (key && key.trim() in updates) {
      updatedKeys.add(key.trim());
      return `${key.trim()}=${updates[key.trim()]}`;
    }
    return line;
  });

  // Add new properties
  for (const [key, value] of Object.entries(updates)) {
    if (!updatedKeys.has(key)) {
      newLines.push(`${key}=${value}`);
    }
  }

  await fs.promises.writeFile(propsPath, newLines.join('\n'));
}

// Common properties with descriptions for the UI
export const propertyDescriptions: Record<string, string> = {
  'server-port': 'Port to run the server on (default: 25565)',
  'max-players': 'Maximum players allowed',
  'motd': 'Message shown in server list',
  'difficulty': 'Game difficulty (peaceful, easy, normal, hard)',
  'gamemode': 'Default game mode (survival, creative, adventure, spectator)',
  'pvp': 'Allow player vs player combat',
  'spawn-monsters': 'Spawn hostile mobs',
  'spawn-animals': 'Spawn passive mobs',
  'allow-flight': 'Allow flying in survival mode',
  'white-list': 'Enable whitelist',
  'online-mode': 'Verify players with Mojang (disable for offline/cracked)',
  'view-distance': 'Render distance in chunks',
  'simulation-distance': 'Entity simulation distance in chunks',
  'level-name': 'World folder name',
  'level-seed': 'World generation seed',
  'spawn-protection': 'Radius of spawn protection',
  'max-world-size': 'Maximum world radius in blocks',
  'enable-command-block': 'Allow command blocks',
};
