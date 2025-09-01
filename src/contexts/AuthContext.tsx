'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, Organization } from '@/types';
import { AuthService } from '@/services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    refreshToken: null,
    organization: null,
    loading: true,
  });

  useEffect(() => {
    // Check for existing auth data on mount
    const { token, refreshToken, organization } = AuthService.getAuthData();
    if (token && organization) {
      setAuthState({
        isAuthenticated: true,
        token,
        refreshToken,
        organization,
        loading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const response = await AuthService.login({ email, password });
      
      if (response.status === 'success') {
        const { token, refreshToken, organization } = response.data;
        
        // Save to localStorage
        AuthService.saveAuthData(token, refreshToken, organization);
        
        // Update state
        setAuthState({
          isAuthenticated: true,
          token,
          refreshToken,
          organization,
          loading: false,
        });
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setAuthState({
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        organization: null,
        loading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
