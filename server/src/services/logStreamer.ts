import { Server } from 'socket.io';
import { Tail } from 'tail';
import { config } from '../utils/config.js';
import fs from 'fs';

export function setupLogStreaming(io: Server): void {
  io.on('connection', (socket) => {
    console.log('Client connected for log streaming');

    const logPath = config.minecraft.logPath;

    // Check if log file exists
    if (!fs.existsSync(logPath)) {
      socket.emit('log', {
        type: 'info',
        message: 'Waiting for server to create log file...',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const tail = new Tail(logPath, {
      follow: true,
      fromBeginning: false,
    });

    tail.on('line', (line: string) => {
      const parsed = parseLogLine(line);
      socket.emit('log', parsed);
    });

    tail.on('error', (error: Error) => {
      socket.emit('log', {
        type: 'error',
        message: `Log streaming error: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from log streaming');
      tail.unwatch();
    });
  });
}

interface ParsedLogLine {
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'chat' | 'player' | 'mod' | 'mixin' | 'debug';
  message: string;
  source?: string;
  raw: string;
}

function parseLogLine(line: string): ParsedLogLine {
  const today = new Date().toISOString().split('T')[0];

  // Vanilla/Fabric format: [HH:MM:SS] [Thread/LEVEL]: Message
  // or with mod source: [HH:MM:SS] [Thread/LEVEL] [ModId]: Message
  const vanillaMatch = line.match(/^\[(\d{2}:\d{2}:\d{2})\] \[([^\]]+)\/(\w+)\](?:\s*\[([^\]]+)\])?: (.+)$/);

  if (vanillaMatch) {
    const [, time, thread, level, source, message] = vanillaMatch;
    return {
      timestamp: `${today}T${time}`,
      type: categorizeLogLine(level, message, thread, source),
      message,
      source: source || extractSourceFromThread(thread),
      raw: line,
    };
  }

  // Fabric loader format: [HH:MM:SS] [LEVEL] (Source) Message
  const fabricMatch = line.match(/^\[(\d{2}:\d{2}:\d{2})\] \[(\w+)\]\s*(?:\(([^)]+)\))?\s*(.+)$/);

  if (fabricMatch) {
    const [, time, level, source, message] = fabricMatch;
    return {
      timestamp: `${today}T${time}`,
      type: categorizeLogLine(level, message, undefined, source),
      message,
      source,
      raw: line,
    };
  }

  // Mixin format: [mixin] ...
  if (line.includes('[mixin]') || line.toLowerCase().includes('mixin')) {
    return {
      timestamp: new Date().toISOString(),
      type: 'mixin',
      message: line,
      source: 'mixin',
      raw: line,
    };
  }

  // Stack trace or continuation line
  if (line.startsWith('\t') || line.startsWith('    ') || line.match(/^\s*at /)) {
    return {
      timestamp: new Date().toISOString(),
      type: 'error',
      message: line,
      raw: line,
    };
  }

  // Fallback
  return {
    timestamp: new Date().toISOString(),
    type: 'info',
    message: line,
    raw: line,
  };
}

function categorizeLogLine(
  level: string,
  message: string,
  thread?: string,
  source?: string
): ParsedLogLine['type'] {
  // Check level first
  const upperLevel = level.toUpperCase();
  if (upperLevel === 'ERROR' || upperLevel === 'FATAL') return 'error';
  if (upperLevel === 'WARN' || upperLevel === 'WARNING') return 'warn';
  if (upperLevel === 'DEBUG' || upperLevel === 'TRACE') return 'debug';

  // Check message content
  if (message.startsWith('<') && message.includes('>')) return 'chat';
  if (message.includes('joined the game') || message.includes('left the game')) return 'player';
  if (message.includes('logged in with') || message.includes('lost connection')) return 'player';

  // Check for mod-related messages
  if (source && source !== 'minecraft' && source !== 'Minecraft') return 'mod';
  if (thread?.includes('Mod') || message.includes('Loading mod')) return 'mod';

  // Mixin detection
  if (source?.toLowerCase().includes('mixin') || message.toLowerCase().includes('mixin')) {
    return 'mixin';
  }

  return 'info';
}

function extractSourceFromThread(thread: string): string | undefined {
  // Extract mod name from thread names like "fabric-lifecycle-events-v1" or "ModName Worker"
  if (thread.includes('/')) {
    return undefined; // Standard thread like "Server thread/INFO"
  }

  // Check for common Fabric API threads
  if (thread.startsWith('fabric-')) {
    return thread;
  }

  return undefined;
}
