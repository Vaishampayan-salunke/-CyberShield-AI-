import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('cybershield_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('cybershield_token');
          }
        } catch (e) {
          console.warn('Failed to load session:', e);
          localStorage.removeItem('cybershield_token');
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('cybershield_token', res.token);
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password, organization) => {
    const res = await api.register({ name, email, password, organization });
    localStorage.setItem('cybershield_token', res.token);
    setUser(res.user);
    return res;
  };

  const loginAsDemo = async () => {
    try {
      return await login('analyst@cybershield.ai', 'cybershield2026');
    } catch (e) {
      // If demo user somehow wasn't registered yet, register and login
      return await register('Chief Security Officer', 'analyst@cybershield.ai', 'cybershield2026', 'CyberShield SOC Enterprise');
    }
  };

  const logout = () => {
    localStorage.removeItem('cybershield_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
