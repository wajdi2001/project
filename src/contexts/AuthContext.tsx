import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  const hasRole = (role: string | string[]) => {
    if (!auth.user) return false;
    if (Array.isArray(role)) {
      return role.includes(auth.user.role);
    }
    return auth.user.role === role;
  };

  return (
    <AuthContext.Provider value={{ ...auth, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};