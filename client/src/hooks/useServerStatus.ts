import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface ServerStatus {
  status: 'stopped' | 'starting' | 'running' | 'stopping';
  uptime: number | null;
  pid: number | null;
}

export function useServerStatus(pollInterval = 5000) {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeader } = useAuth();

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/server/status', {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }

      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, pollInterval]);

  return { status, loading, error, refetch: fetchStatus };
}
