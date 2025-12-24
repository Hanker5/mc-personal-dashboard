import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  credentials: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeader: () => { Authorization: string } | Record<string, never>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<string | null>(() => {
    return localStorage.getItem('mc-dashboard-auth');
  });

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const encoded = btoa(`${username}:${password}`);

    try {
      const response = await fetch('/api/server/status', {
        headers: {
          Authorization: `Basic ${encoded}`,
        },
      });

      if (response.ok) {
        setCredentials(encoded);
        localStorage.setItem('mc-dashboard-auth', encoded);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setCredentials(null);
    localStorage.removeItem('mc-dashboard-auth');
  }, []);

  const getAuthHeader = useCallback(() => {
    if (credentials) {
      return { Authorization: `Basic ${credentials}` };
    }
    return {};
  }, [credentials]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!credentials,
        credentials,
        login,
        logout,
        getAuthHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
