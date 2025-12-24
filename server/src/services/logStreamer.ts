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
  type: 'info' | 'warn' | 'error' | 'chat' | 'player';
  message: string;
  raw: string;
}

function parseLogLine(line: string): ParsedLogLine {
  // Minecraft log format: [HH:MM:SS] [Thread/LEVEL]: Message
  const match = line.match(/^\[(\d{2}:\d{2}:\d{2})\] \[([^\]]+)\/(\w+)\]: (.+)$/);

  if (!match) {
    return {
      timestamp: new Date().toISOString(),
      type: 'info',
      message: line,
      raw: line,
    };
  }

  const [, time, , level, message] = match;
  const today = new Date().toISOString().split('T')[0];

  let type: ParsedLogLine['type'] = 'info';
  if (level === 'WARN') type = 'warn';
  else if (level === 'ERROR') type = 'error';
  else if (message.startsWith('<')) type = 'chat';
  else if (message.includes('joined the game') || message.includes('left the game')) {
    type = 'player';
  }

  return {
    timestamp: `${today}T${time}`,
    type,
    message,
    raw: line,
  };
}
