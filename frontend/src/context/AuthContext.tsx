'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthResponse } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<AuthResponse>;
  register: (data: {
    name: string;
    email: string;
    password?: string;
    age_group?: string;
    interests?: string[];
    spiritual_goals?: string[];
  }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await api.getMe();
        if (currentUser && currentUser.id) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  const login = async (email: string, password?: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password?: string;
    age_group?: string;
    interests?: string[];
    spiritual_goals?: string[];
  }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const updated = await api.updateMe(data);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
