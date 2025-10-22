'use client';

import { useBranch } from '@/contexts/BranchContext';
import { useAuth } from '@/contexts/AuthContext';
import { OrganizationRole } from '@/types';

/**
 * Hook to get branch filtering parameters for API calls
 * Returns the appropriate branchId or null based on user role and selected branch
 */
export const useBranchFilter = () => {
  const { selectedBranch, isViewingAllBranches } = useBranch();
  const { hasRole } = useAuth();

  const getBranchFilter = () => {
    // Only SuperAdmin users can use branch filtering
    if (hasRole(OrganizationRole.SuperAdmin)) {
      // If viewing all branches, don't send branchId (will get all data)
      if (isViewingAllBranches) {
        return null;
      }
      // If a specific branch is selected, send that branchId
      return selectedBranch?.id || null;
    }

    // For all other roles, they can only see their own branch data
    // The backend will handle this based on their organization.branchId
    return null;
  };

  const getBranchDisplayName = () => {
    if (hasRole(OrganizationRole.SuperAdmin) && isViewingAllBranches) {
      return 'All Branches';
    }
    return selectedBranch?.name || 'Current Branch';
  };

  const isFilteringByBranch = () => {
    return !isViewingAllBranches && selectedBranch !== null;
  };

  return {
    branchId: getBranchFilter(),
    branchDisplayName: getBranchDisplayName(),
    isFilteringByBranch: isFilteringByBranch(),
    selectedBranch,
    isViewingAllBranches,
  };
};
