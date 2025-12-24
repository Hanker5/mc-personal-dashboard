interface StatusBadgeProps {
  status: 'stopped' | 'starting' | 'running' | 'stopping';
}

const statusConfig = {
  stopped: { label: 'Stopped', color: 'bg-red-500' },
  starting: { label: 'Starting', color: 'bg-yellow-500 animate-pulse' },
  running: { label: 'Running', color: 'bg-green-500' },
  stopping: { label: 'Stopping', color: 'bg-yellow-500 animate-pulse' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${config.color}`} />
      <span className="font-medium">{config.label}</span>
    </div>
  );
}
