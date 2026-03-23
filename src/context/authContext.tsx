import { createContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth.api';

export interface User {
  id: number;
  nom: string;
  email: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  hasRole: (...roles: string[]) => boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const isLoginPath = window.location.pathname === '/login';
    if (isLoginPath && !user) {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const data = await authApi.me();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);


  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const hasRole = (...roles: string[]) => {
    if (!user?.rol) return false;
    return roles.includes(user.rol);
  };

  const setUser = (user: User | null) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    setUserState(user);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      hasRole,
      setUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
