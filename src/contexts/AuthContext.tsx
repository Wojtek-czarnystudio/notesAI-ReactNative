import React, {createContext, useState, useEffect, ReactNode} from 'react';
import {User, LoginCredentials, RegisterCredentials} from '../types/auth';
import {authService} from '../services/auth';
import {storage} from '../utils/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        const {user: userData} = await authService.me();
        setUser(userData);
      }
    } catch (error) {
      await storage.removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const {user: userData, token} = await authService.login(credentials);
    await storage.setToken(token);
    setUser(userData);
  };

  const register = async (credentials: RegisterCredentials) => {
    const {user: userData, token} = await authService.register(credentials);
    await storage.setToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await storage.removeToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{user, loading, login, register, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
