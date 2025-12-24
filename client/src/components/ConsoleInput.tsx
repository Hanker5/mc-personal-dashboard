import { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ConsoleInput() {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const { getAuthHeader } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/server/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ command: command.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastResult({ success: true, message: data.message });
        setCommand('');
      } else {
        setLastResult({ success: false, message: data.error });
      }
    } catch {
      setLastResult({ success: false, message: 'Failed to send command' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">Console</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command (e.g., say Hello)"
          className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-minecraft-grass focus:outline-none text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !command.trim()}
          className="btn btn-primary disabled:opacity-50"
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
      {lastResult && (
        <p className={`text-sm mt-2 ${lastResult.success ? 'text-green-400' : 'text-red-400'}`}>
          {lastResult.message}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Commands: say, tp, give, gamemode, time, weather, etc.
      </p>
    </div>
  );
}
