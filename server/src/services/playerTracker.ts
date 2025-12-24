import fs from 'fs';
import path from 'path';
import { config } from '../utils/config.js';

interface Player {
  name: string;
  uuid?: string;
  joinedAt: Date;
}

interface PlayerHistoryEntry {
  name: string;
  action: 'join' | 'leave';
  timestamp: Date;
}

class PlayerTracker {
  private onlinePlayers: Map<string, Player> = new Map();
  private history: PlayerHistoryEntry[] = [];
  private maxHistorySize = 100;

  getOnlinePlayers(): Player[] {
    return Array.from(this.onlinePlayers.values());
  }

  getPlayerHistory(): PlayerHistoryEntry[] {
    return [...this.history].reverse();
  }

  playerJoined(name: string, uuid?: string): void {
    const player: Player = {
      name,
      uuid,
      joinedAt: new Date(),
    };

    this.onlinePlayers.set(name, player);
    this.addToHistory(name, 'join');
  }

  playerLeft(name: string): void {
    this.onlinePlayers.delete(name);
    this.addToHistory(name, 'leave');
  }

  clearOnlinePlayers(): void {
    // Called when server stops
    this.onlinePlayers.clear();
  }

  private addToHistory(name: string, action: 'join' | 'leave'): void {
    this.history.push({
      name,
      action,
      timestamp: new Date(),
    });

    // Trim history if needed
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  // Parse ops.json to get operator list
  async getOperators(): Promise<string[]> {
    const opsPath = path.join(config.minecraft.serverPath, 'ops.json');
    try {
      const data = await fs.promises.readFile(opsPath, 'utf-8');
      const ops = JSON.parse(data);
      return ops.map((op: { name: string }) => op.name);
    } catch {
      return [];
    }
  }

  // Parse whitelist.json
  async getWhitelist(): Promise<string[]> {
    const whitelistPath = path.join(config.minecraft.serverPath, 'whitelist.json');
    try {
      const data = await fs.promises.readFile(whitelistPath, 'utf-8');
      const whitelist = JSON.parse(data);
      return whitelist.map((player: { name: string }) => player.name);
    } catch {
      return [];
    }
  }
}

export const playerTracker = new PlayerTracker();
