import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, authStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [token, setToken] = useState(() => authStorage.getToken());
  const [loading, setLoading] = useState(true);

  // Sync state with storage and verify session with backend
  const refreshUser = useCallback(async () => {
    const storedToken = authStorage.getToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe();
      if (res && res.user) {
        setUser(res.user);
        setToken(storedToken);
        authStorage.setUser(res.user);
      }
    } catch (err) {
      // If token expired or invalid, clear storage
      console.warn('Session verification notice:', err.message);
      authStorage.clear();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleAuthChange = () => {
      setUser(authStorage.getUser());
      setToken(authStorage.getToken());
    };

    window.addEventListener('chargenav-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('chargenav-auth-change', handleAuthChange);
    };
  }, [refreshUser]);

  const login = async (credentials) => {
    const res = await api.auth.login(credentials);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const signup = async (userData) => {
    const res = await api.auth.signup(userData);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    setToken(null);
  };

  const saveVehicle = async (vehicleData) => {
    const res = await api.auth.saveVehicle(vehicleData);
    if (res && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const deleteVehicle = async () => {
    const res = await api.auth.deleteVehicle();
    if (res && res.user) {
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        signup,
        logout,
        refreshUser,
        saveVehicle,
        deleteVehicle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
