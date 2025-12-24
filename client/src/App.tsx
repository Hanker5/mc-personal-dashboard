import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import Players from './pages/Players';
import Settings from './pages/Settings';
import Backups from './pages/Backups';
import Mods from './pages/Mods';
import Login from './pages/Login';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/players" element={<Players />} />
        <Route path="/mods" element={<Mods />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/backups" element={<Backups />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
