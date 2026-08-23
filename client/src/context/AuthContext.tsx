import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    flatNumber?: string;
    building?: string;
  }) => Promise<void>;
  logout: () => void;
  switchPersona: (targetRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fixflow_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.data?.user) {
          setUser(res.data.data.user);
          localStorage.setItem('fixflow_user', JSON.stringify(res.data.data.user));
        }
      } catch (err) {
        console.error('Failed to load user profile', err);
        setToken(null);
        setUser(null);
        localStorage.removeItem('fixflow_token');
        localStorage.removeItem('fixflow_user');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('fixflow_token', receivedToken);
    localStorage.setItem('fixflow_user', JSON.stringify(receivedUser));
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const { token: receivedToken, user: receivedUser } = res.data.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('fixflow_token', receivedToken);
    localStorage.setItem('fixflow_user', JSON.stringify(receivedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fixflow_token');
    localStorage.removeItem('fixflow_user');
  };

  const switchPersona = async (targetRole: UserRole) => {
    setLoading(true);
    try {
      const email = targetRole === 'ADMIN' ? 'admin@example.com' : 'resident@example.com';
      await login(email, 'password123');
    } catch (err) {
      console.error('Persona switch failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchPersona,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
