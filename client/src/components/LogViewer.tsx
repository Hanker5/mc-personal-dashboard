import { useEffect, useRef, useState } from 'react';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'chat' | 'player' | 'mod' | 'mixin' | 'debug';
  message: string;
  source?: string;
  raw: string;
}

interface LogViewerProps {
  logs: LogEntry[];
  autoScroll?: boolean;
}

const typeColors: Record<LogEntry['type'], string> = {
  info: 'text-gray-300',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  chat: 'text-blue-400',
  player: 'text-green-400',
  mod: 'text-purple-400',
  mixin: 'text-orange-400',
  debug: 'text-gray-500',
};

const typeLabels: Record<LogEntry['type'], string> = {
  info: '',
  warn: '[WARN]',
  error: '[ERROR]',
  chat: '[CHAT]',
  player: '[PLAYER]',
  mod: '[MOD]',
  mixin: '[MIXIN]',
  debug: '[DEBUG]',
};

type FilterType = 'all' | LogEntry['type'];

export default function LogViewer({ logs, autoScroll = true }: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = filter === 'all' ? logs : logs.filter((log) => log.type === filter);

  const filterButtons: { value: FilterType; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: 'text-white' },
    { value: 'error', label: 'Errors', color: 'text-red-400' },
    { value: 'warn', label: 'Warns', color: 'text-yellow-400' },
    { value: 'mod', label: 'Mods', color: 'text-purple-400' },
    { value: 'chat', label: 'Chat', color: 'text-blue-400' },
    { value: 'player', label: 'Players', color: 'text-green-400' },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-2 flex-wrap">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-2 py-1 text-xs rounded ${
              filter === btn.value
                ? 'bg-gray-600 ' + btn.color
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div
        ref={containerRef}
        className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm"
      >
        {filteredLogs.length === 0 ? (
          <p className="text-gray-500">No logs yet...</p>
        ) : (
          filteredLogs.map((log, i) => (
            <div key={i} className={`py-0.5 ${typeColors[log.type]}`}>
              <span className="text-gray-500 mr-2">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              {typeLabels[log.type] && (
                <span className="mr-1">{typeLabels[log.type]}</span>
              )}
              {log.source && (
                <span className="text-gray-500 mr-1">[{log.source}]</span>
              )}
              {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
