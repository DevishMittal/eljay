'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils';
import { useBranch } from '@/contexts/BranchContext';
import { useAuth } from '@/contexts/AuthContext';
import { Branch, OrganizationRole } from '@/types';

interface BranchDropdownProps {
  className?: string;
}

const BranchDropdown: React.FC<BranchDropdownProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    selectedBranch, 
    allBranches, 
    isLoading, 
    setSelectedBranch, 
    isViewingAllBranches, 
    setViewingAllBranches 
  } = useBranch();
  const { hasRole } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Only show for SuperAdmin users
  if (!hasRole(OrganizationRole.SuperAdmin)) {
    return null;
  }

  const handleBranchSelect = (branch: Branch | null) => {
    if (branch) {
      setSelectedBranch(branch);
      setViewingAllBranches(false);
    }
    setIsOpen(false);
  };

  const handleViewAllBranches = () => {
    setViewingAllBranches(true);
    setSelectedBranch(null);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (isViewingAllBranches) {
      return 'All Branches';
    }
    if (selectedBranch) {
      return selectedBranch.name;
    }
    return 'Select Branch';
  };

  const getDisplayIcon = () => {
    if (isViewingAllBranches) {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        disabled={isLoading}
      >
        {getDisplayIcon()}
        <span className="text-gray-700 font-medium">
          {isLoading ? 'Loading...' : getDisplayText()}
        </span>
        <svg
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            isOpen ? 'rotate-180' : ''
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
          <div className="py-1">
            {/* View All Branches Option - Only for SuperAdmin */}
            {hasRole(OrganizationRole.SuperAdmin) && (
              <>
                <button
                  onClick={handleViewAllBranches}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-2',
                    isViewingAllBranches
                      ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium">All Branches</span>
                  <span className="text-xs text-gray-500 ml-auto">SuperAdmin</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
              </>
            )}

            {/* Individual Branches */}
            {allBranches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleBranchSelect(branch)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between',
                  selectedBranch?.id === branch.id
                    ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <div className="font-medium">{branch.name}</div>
                    <div className="text-xs text-gray-500">{branch.address}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    branch.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  )}>
                    {branch.status}
                  </span>
                </div>
              </button>
            ))}

            {allBranches.length === 0 && !isLoading && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No branches found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchDropdown;
