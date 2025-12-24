import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ModInfo {
  id: string;
  name: string;
  version: string;
  description?: string;
  authors?: string[];
  environment?: string;
  filename: string;
  sizeFormatted: string;
  error?: string;
}

export default function Mods() {
  const [mods, setMods] = useState<ModInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedMod, setExpandedMod] = useState<string | null>(null);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    const fetchMods = async () => {
      try {
        const response = await fetch('/api/mods', {
          headers: getAuthHeader(),
        });

        if (response.ok) {
          const data = await response.json();
          setMods(data.mods);
        } else {
          setError('Failed to load mods');
        }
      } catch {
        setError('Failed to load mods');
      } finally {
        setLoading(false);
      }
    };

    fetchMods();
  }, [getAuthHeader]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-500/20 border border-red-500">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const filteredMods = mods.filter(
    (mod) =>
      mod.name.toLowerCase().includes(search.toLowerCase()) ||
      mod.id.toLowerCase().includes(search.toLowerCase()) ||
      mod.description?.toLowerCase().includes(search.toLowerCase())
  );

  const clientMods = filteredMods.filter((m) => m.environment === 'client');
  const serverMods = filteredMods.filter((m) => m.environment === 'server');
  const universalMods = filteredMods.filter(
    (m) => !m.environment || m.environment === '*'
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Installed Mods ({mods.length})</h2>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search mods..."
        className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-minecraft-grass focus:outline-none"
      />

      {mods.length === 0 ? (
        <div className="card">
          <p className="text-gray-500 text-center py-4">
            No mods found in the mods folder.
          </p>
          <p className="text-gray-600 text-center text-sm">
            Add Fabric mods to your server's mods/ directory.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {universalMods.length > 0 && (
            <ModSection
              title="Universal Mods"
              mods={universalMods}
              expandedMod={expandedMod}
              onToggle={setExpandedMod}
            />
          )}

          {serverMods.length > 0 && (
            <ModSection
              title="Server-Side Mods"
              mods={serverMods}
              expandedMod={expandedMod}
              onToggle={setExpandedMod}
            />
          )}

          {clientMods.length > 0 && (
            <ModSection
              title="Client-Side Mods"
              subtitle="(may not work on dedicated server)"
              mods={clientMods}
              expandedMod={expandedMod}
              onToggle={setExpandedMod}
            />
          )}

          {filteredMods.length === 0 && search && (
            <p className="text-gray-500 text-center py-4">
              No mods match your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ModSection({
  title,
  subtitle,
  mods,
  expandedMod,
  onToggle,
}: {
  title: string;
  subtitle?: string;
  mods: ModInfo[];
  expandedMod: string | null;
  onToggle: (id: string | null) => void;
}) {
  return (
    <div className="card">
      <h3 className="text-md font-semibold mb-3">
        {title} ({mods.length})
        {subtitle && <span className="text-gray-500 text-sm ml-2">{subtitle}</span>}
      </h3>
      <div className="space-y-2">
        {mods.map((mod) => (
          <ModCard
            key={mod.filename}
            mod={mod}
            expanded={expandedMod === mod.id}
            onToggle={() => onToggle(expandedMod === mod.id ? null : mod.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ModCard({
  mod,
  expanded,
  onToggle,
}: {
  mod: ModInfo;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`bg-gray-700 rounded-lg p-3 cursor-pointer transition-colors hover:bg-gray-600 ${
        mod.error ? 'border border-yellow-600' : ''
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{mod.name}</span>
            <span className="text-xs text-gray-400 bg-gray-600 px-2 py-0.5 rounded">
              {mod.version}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">{mod.id}</p>
        </div>
        <span className="text-xs text-gray-500 ml-2">{mod.sizeFormatted}</span>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-600 text-sm space-y-2">
          {mod.description && (
            <p className="text-gray-300">{mod.description}</p>
          )}

          {mod.authors && mod.authors.length > 0 && (
            <p className="text-gray-400">
              <span className="text-gray-500">Authors:</span> {mod.authors.join(', ')}
            </p>
          )}

          <p className="text-gray-400">
            <span className="text-gray-500">File:</span> {mod.filename}
          </p>

          {mod.environment && mod.environment !== '*' && (
            <p className="text-gray-400">
              <span className="text-gray-500">Environment:</span> {mod.environment}
            </p>
          )}

          {mod.error && (
            <p className="text-yellow-400 text-xs">
              Warning: {mod.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
