import { useEffect, useRef } from 'react';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'chat' | 'player';
  message: string;
  raw: string;
}

interface LogViewerProps {
  logs: LogEntry[];
  autoScroll?: boolean;
}

const typeColors = {
  info: 'text-gray-300',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  chat: 'text-blue-400',
  player: 'text-green-400',
};

export default function LogViewer({ logs, autoScroll = true }: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <div
      ref={containerRef}
      className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm"
    >
      {logs.length === 0 ? (
        <p className="text-gray-500">No logs yet...</p>
      ) : (
        logs.map((log, i) => (
          <div key={i} className={`py-0.5 ${typeColors[log.type]}`}>
            <span className="text-gray-500 mr-2">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            {log.message}
          </div>
        ))
      )}
    </div>
  );
}
