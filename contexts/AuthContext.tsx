"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'engineer' | 'manager' | 'supervisor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users data (for development only - in production, use real backend)
const mockUsers: Record<string, { user: User; password: string }> = {
  'engineer@test.com': {
    user: {
      id: '1',
      name: 'Алексей Инженеров',
      email: 'engineer@test.com',
      role: 'engineer'
    },
    password: 'password123' // Use unique passwords in real scenarios
  },
  'manager@test.com': {
    user: {
      id: '2',
      name: 'Мария Менеджерова',
      email: 'manager@test.com',
      role: 'manager'
    },
    password: 'password123'
  },
  'supervisor@test.com': {
    user: {
      id: '3',
      name: 'Иван Руководителев',
      email: 'supervisor@test.com',
      role: 'supervisor'
    },
    password: 'password123'
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth token from secure storage (e.g., httpOnly cookie)
    // In real app, fetch user from backend with token
    const savedUser = localStorage.getItem('mockUser'); // Not secure - demo only
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Validate user exists in mock (in real: verify token)
        if (mockUsers[parsedUser.email]) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Invalid saved user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock authentication
    const userData = mockUsers[email];
    if (userData && userData.password === password) {
      setUser(userData.user);
      // In real app: set httpOnly cookie with JWT
      localStorage.setItem('mockUser', JSON.stringify(userData.user)); // Demo only
      setIsLoading(false);
      router.push('/dashboard'); // Auto-redirect on success
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
    // In real: clear cookie and redirect
    router.push('/');
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