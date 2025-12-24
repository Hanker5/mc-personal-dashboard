import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ResourceStats {
  cpu: { usage: number; cores: number };
  memory: {
    usagePercent: number;
    usedFormatted: string;
    totalFormatted: string;
  };
  disk: {
    usagePercent: number;
    usedFormatted: string;
    totalFormatted: string;
  };
  uptimeFormatted: string;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export default function ResourceMonitor() {
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/resources', {
          headers: getAuthHeader(),
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
          setError(null);
        }
      } catch {
        setError('Failed to load resources');
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [getAuthHeader]);

  if (error) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-3">System Resources</h3>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-3">System Resources</h3>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  const cpuColor = stats.cpu.usage > 80 ? 'bg-red-500' : stats.cpu.usage > 50 ? 'bg-yellow-500' : 'bg-green-500';
  const memColor = stats.memory.usagePercent > 80 ? 'bg-red-500' : stats.memory.usagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500';
  const diskColor = stats.disk.usagePercent > 80 ? 'bg-red-500' : stats.disk.usagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">System Resources</h3>
        <span className="text-sm text-gray-400">Uptime: {stats.uptimeFormatted}</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>CPU ({stats.cpu.cores} cores)</span>
            <span>{stats.cpu.usage}%</span>
          </div>
          <ProgressBar value={stats.cpu.usage} color={cpuColor} />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Memory</span>
            <span>{stats.memory.usedFormatted} / {stats.memory.totalFormatted}</span>
          </div>
          <ProgressBar value={stats.memory.usagePercent} color={memColor} />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Disk</span>
            <span>{stats.disk.usedFormatted} / {stats.disk.totalFormatted}</span>
          </div>
          <ProgressBar value={stats.disk.usagePercent} color={diskColor} />
        </div>
      </div>
    </div>
  );
}
