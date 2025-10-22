'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Branch, OrganizationRole } from '@/types';
import { useAuth } from './AuthContext';
import branchService from '@/services/branchService';

interface BranchContextType {
  selectedBranch: Branch | null;
  allBranches: Branch[];
  isLoading: boolean;
  setSelectedBranch: (branch: Branch | null) => void;
  refreshBranches: () => Promise<void>;
  isViewingAllBranches: boolean;
  setViewingAllBranches: (viewing: boolean) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewingAllBranches, setViewingAllBranches] = useState(false);
  const { organization, token, hasRole } = useAuth();

  // Load branches when component mounts or when user changes
  useEffect(() => {
    if (token && hasRole(OrganizationRole.SuperAdmin)) {
      loadBranches();
    }
  }, [token, organization]);

  const loadBranches = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      // Fetch all branches (no pagination limit for dropdown)
      const response = await branchService.getBranches(1, 100, token);
      if (response.status === 'success') {
        setAllBranches(response.data.branches);
        
        // If user has a specific branch, set it as selected
        if (organization?.branchId && !isViewingAllBranches) {
          const userBranch = response.data.branches.find(
            branch => branch.id === organization.branchId
          );
          if (userBranch) {
            setSelectedBranch(userBranch);
          }
        }
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBranches = async () => {
    await loadBranches();
  };

  const handleSetSelectedBranch = (branch: Branch | null) => {
    setSelectedBranch(branch);
    setViewingAllBranches(false);
  };

  const handleSetViewingAllBranches = (viewing: boolean) => {
    setViewingAllBranches(viewing);
    if (viewing) {
      setSelectedBranch(null);
    }
  };

  const value: BranchContextType = {
    selectedBranch,
    allBranches,
    isLoading,
    setSelectedBranch: handleSetSelectedBranch,
    refreshBranches,
    isViewingAllBranches,
    setViewingAllBranches: handleSetViewingAllBranches,
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}
