import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { config } from '../utils/config.js';

interface BackupInfo {
  name: string;
  path: string;
  size: number;
  createdAt: Date;
}

const BACKUP_DIR = path.join(config.minecraft.serverPath, 'backups');

async function ensureBackupDir(): Promise<void> {
  try {
    await fs.promises.mkdir(BACKUP_DIR, { recursive: true });
  } catch {
    // Directory might already exist
  }
}

export async function listBackups(): Promise<BackupInfo[]> {
  await ensureBackupDir();

  try {
    const files = await fs.promises.readdir(BACKUP_DIR);
    const backups: BackupInfo[] = [];

    for (const file of files) {
      if (file.endsWith('.tar.gz') || file.endsWith('.zip')) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await fs.promises.stat(filePath);
        backups.push({
          name: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime,
        });
      }
    }

    return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch {
    return [];
  }
}

export async function createBackup(worldName?: string): Promise<string> {
  await ensureBackupDir();

  const world = worldName || 'world';
  const worldPath = path.join(config.minecraft.serverPath, world);

  // Check if world exists
  try {
    await fs.promises.access(worldPath);
  } catch {
    throw new Error(`World folder '${world}' not found`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${world}-${timestamp}.tar.gz`;
  const backupPath = path.join(BACKUP_DIR, backupName);

  return new Promise((resolve, reject) => {
    const tar = spawn('tar', ['-czf', backupPath, '-C', config.minecraft.serverPath, world]);

    let stderr = '';
    tar.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    tar.on('close', (code) => {
      if (code === 0) {
        resolve(backupName);
      } else {
        reject(new Error(`Backup failed: ${stderr}`));
      }
    });

    tar.on('error', (err) => {
      reject(new Error(`Failed to start backup: ${err.message}`));
    });
  });
}

export async function restoreBackup(backupName: string): Promise<void> {
  const backupPath = path.join(BACKUP_DIR, backupName);

  // Check if backup exists
  try {
    await fs.promises.access(backupPath);
  } catch {
    throw new Error(`Backup '${backupName}' not found`);
  }

  // Extract world name from backup filename
  const worldMatch = backupName.match(/^(.+?)-\d{4}-\d{2}-\d{2}/);
  const worldName = worldMatch ? worldMatch[1] : 'world';
  const worldPath = path.join(config.minecraft.serverPath, worldName);

  // Remove existing world folder
  try {
    await fs.promises.rm(worldPath, { recursive: true, force: true });
  } catch {
    // Folder might not exist
  }

  return new Promise((resolve, reject) => {
    const tar = spawn('tar', ['-xzf', backupPath, '-C', config.minecraft.serverPath]);

    let stderr = '';
    tar.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    tar.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Restore failed: ${stderr}`));
      }
    });

    tar.on('error', (err) => {
      reject(new Error(`Failed to start restore: ${err.message}`));
    });
  });
}

export async function deleteBackup(backupName: string): Promise<void> {
  const backupPath = path.join(BACKUP_DIR, backupName);

  // Validate filename to prevent directory traversal
  if (backupName.includes('/') || backupName.includes('..')) {
    throw new Error('Invalid backup name');
  }

  await fs.promises.unlink(backupPath);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
