"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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

// Mock users 
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Алексей Инженеров',
    email: 'engineer@test.com',
    role: 'engineer'
  },
  {
    id: '2',
    name: 'Мария Менеджерова',
    email: 'manager@test.com',
    role: 'manager'
  },
  {
    id: '3',
    name: 'Иван Руководителев',
    email: 'supervisor@test.com',
    role: 'supervisor'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Mock authentication 
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser && password.toLowerCase() === 'password') {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
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