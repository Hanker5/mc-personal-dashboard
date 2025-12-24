import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Properties {
  [key: string]: string;
}

interface Descriptions {
  [key: string]: string;
}

export default function Settings() {
  const [properties, setProperties] = useState<Properties>({});
  const [descriptions, setDescriptions] = useState<Descriptions>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties', {
        headers: getAuthHeader(),
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties);
        setDescriptions(data.descriptions);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load properties' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setProperties((prev) => ({ ...prev, [key]: value }));
    setModified((prev) => new Set(prev).add(key));
    setMessage(null);
  };

  const handleSave = async () => {
    if (modified.size === 0) return;

    setSaving(true);
    setMessage(null);

    const updates: Properties = {};
    modified.forEach((key) => {
      updates[key] = properties[key];
    });

    try {
      const response = await fetch('/api/properties', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ properties: updates }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setModified(new Set());
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save properties' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // Important properties to show first
  const priorityKeys = [
    'server-port',
    'max-players',
    'motd',
    'difficulty',
    'gamemode',
    'pvp',
    'white-list',
    'online-mode',
    'view-distance',
  ];

  const sortedKeys = [
    ...priorityKeys.filter((k) => k in properties),
    ...Object.keys(properties)
      .filter((k) => !priorityKeys.includes(k))
      .sort(),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Server Properties</h2>
        <button
          onClick={handleSave}
          disabled={saving || modified.size === 0}
          className="btn btn-primary disabled:opacity-50"
        >
          {saving ? 'Saving...' : `Save (${modified.size})`}
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
        <div className="space-y-4">
          {sortedKeys.map((key) => (
            <div key={key} className={modified.has(key) ? 'ring-1 ring-minecraft-grass rounded-lg p-2 -m-2' : ''}>
              <label className="block text-sm font-medium mb-1">
                {key}
                {modified.has(key) && <span className="text-minecraft-grass ml-1">*</span>}
              </label>
              {descriptions[key] && (
                <p className="text-xs text-gray-500 mb-1">{descriptions[key]}</p>
              )}
              {properties[key] === 'true' || properties[key] === 'false' ? (
                <select
                  value={properties[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-minecraft-grass focus:outline-none"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={properties[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-minecraft-grass focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {Object.keys(properties).length === 0 && (
        <p className="text-gray-500 text-center">
          No server.properties file found. Start the server once to generate it.
        </p>
      )}
    </div>
  );
}
