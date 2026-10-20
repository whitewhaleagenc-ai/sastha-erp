import { useState, useEffect, createContext, useContext } from 'react';
import Login from './pages/Login';
import Layout from './pages/Layout';

export const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sastha_user')); } catch { return null; }
  });

  const login = (userData, token) => {
    localStorage.setItem('sastha_token', token);
    localStorage.setItem('sastha_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('sastha_token');
    localStorage.removeItem('sastha_user');
    setUser(null);
  };

  if (!user) return <AuthCtx.Provider value={{ user, login, logout }}><Login /></AuthCtx.Provider>;
  return <AuthCtx.Provider value={{ user, login, logout }}><Layout /></AuthCtx.Provider>;
}
