import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';
import { tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) return setChecking(false);
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('lulea:logout', onLogout);
    return () => window.removeEventListener('lulea:logout', onLogout);
  }, []);

  const login = async (username, password) => {
    const r = await api.login(username, password);
    tokenStore.set(r.token);
    setUser(r.user);
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, checking, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
