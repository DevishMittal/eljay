'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, Organization, OrganizationRole } from '@/types';
import { AuthService } from '@/services/authService';
import { OrganizationService } from '@/services/organizationService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
  hasRole: (role: OrganizationRole | OrganizationRole[]) => boolean;
  hasBranchAccess: (branchId?: string) => boolean;
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

  const refreshOrganization = async () => {
    try {
      const { token } = authState;
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await OrganizationService.getProfile(token);
      
      if (response.status === 'success') {
        // Update the organization in state
        setAuthState(prev => ({
          ...prev,
          organization: response.data
        }));
        
        // Update the organization in localStorage
        AuthService.updateOrganizationInStorage(response.data);
      }
    } catch (error) {
      console.error('Error refreshing organization:', error);
      throw error;
    }
  };

  // Role-based utility functions
  const hasRole = (role: OrganizationRole | OrganizationRole[]): boolean => {
    if (!authState.organization) return false;
    
    const userRole = authState.organization.role;
    
    // SuperAdmin has access to everything
    if (userRole === OrganizationRole.SuperAdmin) return true;
    
    // Check if user has the required role(s)
    const requiredRoles = Array.isArray(role) ? role : [role];
    return requiredRoles.includes(userRole);
  };

  const hasBranchAccess = (branchId?: string): boolean => {
    if (!authState.organization) return false;
    
    const userRole = authState.organization.role;
    
    // SuperAdmin and Admin can access all branches
    if (userRole === OrganizationRole.SuperAdmin || userRole === OrganizationRole.Admin) {
      return true;
    }
    
    // For other roles, check if they're trying to access their own branch
    if (branchId && authState.organization.branchId !== branchId) {
      return false;
    }
    
    return true;
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshOrganization,
    hasRole,
    hasBranchAccess,
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
