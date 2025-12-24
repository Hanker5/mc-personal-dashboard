import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'chat' | 'player';
  message: string;
  raw: string;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const newSocket = io({
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('log', (entry: LogEntry) => {
      setLogs((prev) => [...prev.slice(-499), entry]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { socket, connected, logs, clearLogs };
}
