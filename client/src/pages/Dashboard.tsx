import { useServerStatus } from '../hooks/useServerStatus';
import StatusBadge from '../components/StatusBadge';
import ServerControls from '../components/ServerControls';
import ConsoleInput from '../components/ConsoleInput';
import ResourceMonitor from '../components/ResourceMonitor';

export default function Dashboard() {
  const { status, loading, error, refetch } = useServerStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-500/20 border border-red-500">
        <p className="text-red-400">Error: {error}</p>
        <button onClick={refetch} className="btn btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const formatUptime = (ms: number | null): string => {
    if (!ms) return '--';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Server Status</h2>
        <div className="flex items-center justify-between mb-6">
          <StatusBadge status={status.status} />
          {status.uptime && (
            <span className="text-gray-400">Uptime: {formatUptime(status.uptime)}</span>
          )}
        </div>
        <ServerControls status={status.status} onAction={refetch} />
      </div>

      {status.status === 'running' && <ConsoleInput />}

      <ResourceMonitor />

      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-minecraft-grass">
            {status.status === 'running' ? 'Online' : '--'}
          </div>
          <div className="text-gray-400 text-sm mt-1">Status</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-minecraft-diamond">
            {status.pid || '--'}
          </div>
          <div className="text-gray-400 text-sm mt-1">PID</div>
        </div>
      </div>
    </div>
  );
}
