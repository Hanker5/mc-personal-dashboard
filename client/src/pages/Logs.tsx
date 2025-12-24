import { useSocket } from '../hooks/useSocket';
import LogViewer from '../components/LogViewer';

export default function Logs() {
  const { connected, logs, clearLogs } = useSocket();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Server Logs</h2>
        <div className="flex items-center gap-4">
          <span
            className={`flex items-center gap-2 text-sm ${
              connected ? 'text-green-400' : 'text-red-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            {connected ? 'Live' : 'Disconnected'}
          </span>
          <button onClick={clearLogs} className="text-sm text-gray-400 hover:text-white">
            Clear
          </button>
        </div>
      </div>

      <LogViewer logs={logs} />

      <p className="text-xs text-gray-500">
        Showing last {logs.length} log entries. Logs stream in real-time when server is running.
      </p>
    </div>
  );
}
