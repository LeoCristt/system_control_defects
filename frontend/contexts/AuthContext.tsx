"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type UserRole = 'engineer' | 'manager' | 'leader';

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeToken(token: string): User {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return { id: payload.sub, email: payload.email, role: payload.role };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      try {
        const decodedUser = decodeToken(accessToken);
        setUser(decodedUser);
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        const decodedUser = decodeToken(data.access_token);
        setUser(decodedUser);
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error', error);
    }

    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        const res = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!res.ok) {
          console.error('Logout API call failed');
        }
      }
    } catch (error) {
      console.error('Logout error', error);
    }

    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}