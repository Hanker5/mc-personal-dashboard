import os from 'os';
import fs from 'fs';
import { spawn } from 'child_process';
import { config } from '../utils/config.js';

interface ResourceStats {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
    path: string;
  };
  uptime: number;
}

interface CpuTimes {
  idle: number;
  total: number;
}

let lastCpuTimes: CpuTimes | null = null;

function getCpuTimes(): CpuTimes {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;

  for (const cpu of cpus) {
    idle += cpu.times.idle;
    total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
  }

  return { idle, total };
}

function calculateCpuUsage(): number {
  const current = getCpuTimes();

  if (!lastCpuTimes) {
    lastCpuTimes = current;
    return 0;
  }

  const idleDiff = current.idle - lastCpuTimes.idle;
  const totalDiff = current.total - lastCpuTimes.total;

  lastCpuTimes = current;

  if (totalDiff === 0) return 0;

  return Math.round((1 - idleDiff / totalDiff) * 100);
}

async function getDiskUsage(dirPath: string): Promise<{ total: number; used: number; free: number }> {
  return new Promise((resolve, reject) => {
    const df = spawn('df', ['-B1', dirPath]);

    let stdout = '';
    df.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    df.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Failed to get disk usage'));
        return;
      }

      const lines = stdout.trim().split('\n');
      if (lines.length < 2) {
        reject(new Error('Unexpected df output'));
        return;
      }

      const parts = lines[1].split(/\s+/);
      if (parts.length < 4) {
        reject(new Error('Unexpected df output format'));
        return;
      }

      resolve({
        total: parseInt(parts[1], 10),
        used: parseInt(parts[2], 10),
        free: parseInt(parts[3], 10),
      });
    });

    df.on('error', () => {
      // Fallback for systems without df
      resolve({ total: 0, used: 0, free: 0 });
    });
  });
}

export async function getResourceStats(): Promise<ResourceStats> {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  let diskStats = { total: 0, used: 0, free: 0 };
  try {
    // Check if server path exists, otherwise use root
    const pathToCheck = fs.existsSync(config.minecraft.serverPath)
      ? config.minecraft.serverPath
      : '/';
    diskStats = await getDiskUsage(pathToCheck);
  } catch {
    // Disk stats unavailable
  }

  return {
    cpu: {
      usage: calculateCpuUsage(),
      cores: os.cpus().length,
    },
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usagePercent: Math.round((usedMem / totalMem) * 100),
    },
    disk: {
      total: diskStats.total,
      used: diskStats.used,
      free: diskStats.free,
      usagePercent: diskStats.total > 0
        ? Math.round((diskStats.used / diskStats.total) * 100)
        : 0,
      path: config.minecraft.serverPath,
    },
    uptime: os.uptime(),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
