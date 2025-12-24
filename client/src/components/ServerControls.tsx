import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ServerControlsProps {
  status: 'stopped' | 'starting' | 'running' | 'stopping';
  onAction: () => void;
}

export default function ServerControls({ status, onAction }: ServerControlsProps) {
  const [loading, setLoading] = useState(false);
  const { getAuthHeader } = useAuth();

  const sendCommand = async (action: 'start' | 'stop' | 'restart') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/server/${action}`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      onAction();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || status === 'starting' || status === 'stopping';

  return (
    <div className="flex gap-3">
      {status === 'stopped' ? (
        <button
          onClick={() => sendCommand('start')}
          disabled={isDisabled}
          className="btn btn-primary flex-1 disabled:opacity-50"
        >
          {loading ? 'Starting...' : 'Start Server'}
        </button>
      ) : (
        <>
          <button
            onClick={() => sendCommand('stop')}
            disabled={isDisabled}
            className="btn btn-danger flex-1 disabled:opacity-50"
          >
            {loading ? 'Stopping...' : 'Stop'}
          </button>
          <button
            onClick={() => sendCommand('restart')}
            disabled={isDisabled}
            className="btn btn-warning flex-1 disabled:opacity-50"
          >
            {loading ? 'Restarting...' : 'Restart'}
          </button>
        </>
      )}
    </div>
  );
}
