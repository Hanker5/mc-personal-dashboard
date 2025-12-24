import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { config } from '../utils/config.js';

export interface ModInfo {
  id: string;
  name: string;
  version: string;
  description?: string;
  authors?: string[];
  environment?: string;
  filename: string;
  size: number;
  error?: string;
}

const MODS_DIR = path.join(config.minecraft.serverPath, 'mods');

export async function listMods(): Promise<ModInfo[]> {
  try {
    await fs.promises.access(MODS_DIR);
  } catch {
    return [];
  }

  const files = await fs.promises.readdir(MODS_DIR);
  const jarFiles = files.filter((f) => f.endsWith('.jar'));

  const mods: ModInfo[] = [];

  for (const filename of jarFiles) {
    const filePath = path.join(MODS_DIR, filename);
    const stats = await fs.promises.stat(filePath);

    try {
      const modJson = await extractFabricModJson(filePath);

      if (modJson) {
        const id = String(modJson.id || filename);
        const name = String(modJson.name || modJson.id || filename);
        const version = String(modJson.version || 'unknown');
        const description = modJson.description ? String(modJson.description) : undefined;
        const environment = String(modJson.environment || '*');

        mods.push({
          id,
          name,
          version,
          description,
          authors: parseAuthors(modJson.authors),
          environment,
          filename,
          size: stats.size,
        });
      } else {
        // Fallback for non-Fabric mods or mods without fabric.mod.json
        mods.push({
          id: filename.replace('.jar', ''),
          name: formatModName(filename),
          version: extractVersionFromFilename(filename),
          filename,
          size: stats.size,
        });
      }
    } catch (error) {
      mods.push({
        id: filename.replace('.jar', ''),
        name: formatModName(filename),
        version: 'unknown',
        filename,
        size: stats.size,
        error: error instanceof Error ? error.message : 'Failed to read mod info',
      });
    }
  }

  return mods.sort((a, b) => a.name.localeCompare(b.name));
}

async function extractFabricModJson(jarPath: string): Promise<Record<string, unknown> | null> {
  return new Promise((resolve) => {
    const unzip = spawn('unzip', ['-p', jarPath, 'fabric.mod.json']);

    let stdout = '';
    let stderr = '';

    unzip.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    unzip.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    unzip.on('close', (code) => {
      if (code === 0 && stdout) {
        try {
          resolve(JSON.parse(stdout));
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });

    unzip.on('error', () => {
      resolve(null);
    });
  });
}

function parseAuthors(authors: unknown): string[] | undefined {
  if (!authors) return undefined;

  if (Array.isArray(authors)) {
    return authors.map((a) => {
      if (typeof a === 'string') return a;
      if (typeof a === 'object' && a !== null && 'name' in a) {
        return String((a as { name: unknown }).name);
      }
      return String(a);
    });
  }

  return undefined;
}

function formatModName(filename: string): string {
  // Remove .jar extension and common version patterns
  let name = filename.replace('.jar', '');

  // Remove version suffix (e.g., -1.0.0, _1.20.1)
  name = name.replace(/[-_][\d.]+(?:[-_][\d.]+)*$/, '');
  name = name.replace(/[-_](?:mc)?[\d.]+[-_]?.*$/i, '');

  // Convert kebab-case or snake_case to Title Case
  name = name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return name;
}

function extractVersionFromFilename(filename: string): string {
  // Try to extract version from filename patterns like mod-1.0.0.jar
  const match = filename.match(/[-_]([\d.]+(?:[-_][\d.]+)?)\.jar$/);
  return match ? match[1] : 'unknown';
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
