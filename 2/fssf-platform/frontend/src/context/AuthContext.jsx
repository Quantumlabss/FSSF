import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

const ROLE_LEVELS = { recruit: 0, member: 1, nco: 2, officer: 3, admin: 4 };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = () => {
    window.location.href = '/api/auth/discord';
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const hasRole = (minRole) => {
    if (!user) return false;
    return (ROLE_LEVELS[user.role] ?? 0) >= (ROLE_LEVELS[minRole] ?? 99);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
