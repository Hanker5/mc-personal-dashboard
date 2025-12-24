import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import PlayerActions from '../components/PlayerActions';

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
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [operators, setOperators] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlayer, setNewPlayer] = useState('');
  const [addingToWhitelist, setAddingToWhitelist] = useState(false);
  const { getAuthHeader } = useAuth();

  const fetchData = async () => {
    try {
      const [playersRes, historyRes, whitelistRes, opsRes] = await Promise.all([
        fetch('/api/players', { headers: getAuthHeader() }),
        fetch('/api/players/history', { headers: getAuthHeader() }),
        fetch('/api/players/whitelist', { headers: getAuthHeader() }),
        fetch('/api/players/operators', { headers: getAuthHeader() }),
      ]);

      if (playersRes.ok) {
        const data = await playersRes.json();
        setPlayers(data.players);
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data.history);
      }

      if (whitelistRes.ok) {
        const data = await whitelistRes.json();
        setWhitelist(data.whitelist);
      }

      if (opsRes.ok) {
        const data = await opsRes.json();
        setOperators(data.operators);
      }
    } catch (err) {
      console.error('Failed to fetch player data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [getAuthHeader]);

  const handleAddToWhitelist = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPlayer.trim()) return;

    setAddingToWhitelist(true);
    try {
      const response = await fetch('/api/players/whitelist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ player: newPlayer.trim() }),
      });

      if (response.ok) {
        setNewPlayer('');
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add to whitelist');
      }
    } catch {
      alert('Failed to add to whitelist');
    } finally {
      setAddingToWhitelist(false);
    }
  };

  const handleRemoveFromWhitelist = async (player: string) => {
    try {
      const response = await fetch('/api/players/whitelist/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ player }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch {
      alert('Failed to remove from whitelist');
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
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          Online Players ({players.length})
        </h2>
        {players.length === 0 ? (
          <p className="text-gray-500">No players online</p>
        ) : (
          <ul className="space-y-3">
            {players.map((player) => (
              <li
                key={player.name}
                className="bg-gray-700 rounded-lg px-4 py-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{player.name}</span>
                  <span className="text-sm text-gray-400">
                    Joined {new Date(player.joinedAt).toLocaleTimeString()}
                  </span>
                </div>
                <PlayerActions player={player.name} onAction={fetchData} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Whitelist</h2>
        <form onSubmit={handleAddToWhitelist} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            placeholder="Player name"
            className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-minecraft-grass focus:outline-none"
          />
          <button
            type="submit"
            disabled={addingToWhitelist || !newPlayer.trim()}
            className="btn btn-primary disabled:opacity-50"
          >
            Add
          </button>
        </form>
        {whitelist.length === 0 ? (
          <p className="text-gray-500 text-sm">No players on whitelist</p>
        ) : (
          <ul className="space-y-2">
            {whitelist.map((player) => (
              <li
                key={player}
                className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2"
              >
                <span className="text-sm">
                  {player}
                  {operators.includes(player) && (
                    <span className="ml-2 text-xs text-minecraft-gold">[OP]</span>
                  )}
                </span>
                <button
                  onClick={() => handleRemoveFromWhitelist(player)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Operators</h2>
        {operators.length === 0 ? (
          <p className="text-gray-500 text-sm">No operators configured</p>
        ) : (
          <ul className="space-y-2">
            {operators.map((op) => (
              <li key={op} className="text-sm bg-gray-700 rounded-lg px-3 py-2">
                {op}
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
