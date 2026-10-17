import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

const USER_SESSION_KEY = 'dalilukum_user_session_v1';

interface AuthContextType {
  user: User | null;
  login: (phone: string, id?: number, countryId?: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.phone) {
          return { ...parsed, isLoggedIn: true };
        }
      }
    } catch {
      // ignore corrupted session
    }
    return null;
  });

  const login = (phone: string, id?: number, countryId?: number) => {
    const nextUser: User = { id, phone, countryId, isLoggedIn: true };
    setUser(nextUser);
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(nextUser));
    } catch {
      // ignore storage error
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_SESSION_KEY);
    } catch {
      // ignore storage error
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
