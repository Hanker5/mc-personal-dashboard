import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface PlayerActionsProps {
  player: string;
  onAction?: () => void;
}

export default function PlayerActions({ player, onAction }: PlayerActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const { getAuthHeader } = useAuth();

  const executeAction = async (action: string, endpoint: string) => {
    setLoading(action);
    setShowConfirm(null);

    try {
      const response = await fetch(`/api/players/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ player }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Action failed');
      } else {
        onAction?.();
      }
    } catch {
      alert('Failed to execute action');
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    { key: 'kick', label: 'Kick', endpoint: 'kick', confirm: true },
    { key: 'ban', label: 'Ban', endpoint: 'ban', confirm: true, danger: true },
    { key: 'op', label: 'OP', endpoint: 'op', confirm: true },
    { key: 'deop', label: 'De-OP', endpoint: 'deop', confirm: false },
  ];

  return (
    <div className="flex gap-1 flex-wrap">
      {actions.map(({ key, label, endpoint, confirm, danger }) => (
        <div key={key} className="relative">
          {showConfirm === key ? (
            <div className="flex gap-1">
              <button
                onClick={() => executeAction(key, endpoint)}
                disabled={loading !== null}
                className={`px-2 py-1 text-xs rounded ${
                  danger ? 'bg-red-600' : 'bg-green-600'
                } text-white`}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                className="px-2 py-1 text-xs rounded bg-gray-600 text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => (confirm ? setShowConfirm(key) : executeAction(key, endpoint))}
              disabled={loading !== null}
              className={`px-2 py-1 text-xs rounded ${
                danger
                  ? 'bg-red-600/20 text-red-400 hover:bg-red-600/40'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              } disabled:opacity-50`}
            >
              {loading === key ? '...' : label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
