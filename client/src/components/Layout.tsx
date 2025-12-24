import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-minecraft-grass">MC Dashboard</h1>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-white">
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      <nav className="bg-gray-800 border-t border-gray-700 sticky bottom-0">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            <NavItem to="/" label="Home" icon="⚡" />
            <NavItem to="/logs" label="Logs" icon="📜" />
            <NavItem to="/players" label="Players" icon="👥" />
            <NavItem to="/backups" label="Backups" icon="💾" />
            <NavItem to="/settings" label="Settings" icon="⚙️" />
          </div>
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${
          isActive ? 'text-minecraft-grass bg-gray-700' : 'text-gray-400 hover:text-white'
        }`
      }
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );
}
