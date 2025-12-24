import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Player {
  name: string;
  uuid?: string;
  joinedAt: string;
}

interface HistoryEntry {
  name: string;
  action: 'join' | 'leave';
  timestamp: string;
}

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, historyRes] = await Promise.all([
          fetch('/api/players', { headers: getAuthHeader() }),
          fetch('/api/players/history', { headers: getAuthHeader() }),
        ]);

        if (playersRes.ok) {
          const data = await playersRes.json();
          setPlayers(data.players);
        }

        if (historyRes.ok) {
          const data = await historyRes.json();
          setHistory(data.history);
        }
      } catch (err) {
        console.error('Failed to fetch player data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [getAuthHeader]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          Online Players ({players.length})
        </h2>
        {players.length === 0 ? (
          <p className="text-gray-500">No players online</p>
        ) : (
          <ul className="space-y-2">
            {players.map((player) => (
              <li
                key={player.name}
                className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2"
              >
                <span className="font-medium">{player.name}</span>
                <span className="text-sm text-gray-400">
                  Joined {new Date(player.joinedAt).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No recent activity</p>
        ) : (
          <ul className="space-y-2">
            {history.slice(0, 20).map((entry, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span
                  className={entry.action === 'join' ? 'text-green-400' : 'text-red-400'}
                >
                  {entry.action === 'join' ? '→' : '←'}
                </span>
                <span className="font-medium">{entry.name}</span>
                <span className="text-gray-500">
                  {entry.action === 'join' ? 'joined' : 'left'}
                </span>
                <span className="text-gray-500 ml-auto">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
