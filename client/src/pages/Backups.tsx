import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Backup {
  name: string;
  sizeFormatted: string;
  createdAt: string;
}

export default function Backups() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { getAuthHeader } = useAuth();

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/backup', {
        headers: getAuthHeader(),
      });

      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load backups' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const createBackup = async () => {
    setCreating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchBackups();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to create backup' });
    } finally {
      setCreating(false);
    }
  };

  const restoreBackup = async (name: string) => {
    if (!confirm(`Restore backup "${name}"? This will replace the current world. Make sure the server is stopped!`)) {
      return;
    }

    setRestoring(name);
    setMessage(null);

    try {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ backupName: name }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to restore backup' });
    } finally {
      setRestoring(null);
    }
  };

  const deleteBackup = async (name: string) => {
    if (!confirm(`Delete backup "${name}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(name);
    setMessage(null);

    try {
      const response = await fetch(`/api/backup/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchBackups();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete backup' });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">World Backups</h2>
        <button
          onClick={createBackup}
          disabled={creating}
          className="btn btn-primary disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Backup'}
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="card">
        <p className="text-sm text-gray-400 mb-4">
          Stop the server before restoring a backup to prevent data corruption.
        </p>

        {backups.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No backups yet</p>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div
                key={backup.name}
                className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{backup.name}</p>
                  <p className="text-sm text-gray-400">
                    {backup.sizeFormatted} &middot;{' '}
                    {new Date(backup.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => restoreBackup(backup.name)}
                    disabled={restoring !== null || deleting !== null}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                  >
                    {restoring === backup.name ? '...' : 'Restore'}
                  </button>
                  <button
                    onClick={() => deleteBackup(backup.name)}
                    disabled={restoring !== null || deleting !== null}
                    className="px-3 py-1 text-sm bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded disabled:opacity-50"
                  >
                    {deleting === backup.name ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
