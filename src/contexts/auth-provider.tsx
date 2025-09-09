"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { users as mockUsers } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('classpal-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('classpal-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    // In a real app, you'd have an API call here.
    // We'll simulate it with a timeout.
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(
          (u) => u.email === email && u.password === password
        );

        if (foundUser) {
          const { password, ...userToStore } = foundUser;
          setUser(userToStore);
          localStorage.setItem('classpal-user', JSON.stringify(userToStore));
          router.push('/dashboard');
          resolve(true);
        } else {
          setUser(null);
          localStorage.removeItem('classpal-user');
          resolve(false);
        }
        setLoading(false);
      }, 500);
    });
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('classpal-user');
    router.push('/');
  }, [router]);

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
