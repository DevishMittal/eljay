import { ReferralSourceResponse, ReferralSource } from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class ReferralService {
  // Get all referral sources
  async getReferrals(token?: string, branchId?: string | null): Promise<ReferralSourceResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (branchId) {
        queryParams.append('branchId', branchId);
      }

      const url = queryParams.toString() 
        ? `${BASE_URL}/api/v1/referrals?${queryParams.toString()}`
        : `${BASE_URL}/api/v1/referrals`;

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch referrals: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching referrals:', error);
      throw error;
    }
  }

  // Create new referral source
  async createReferral(referralData: Omit<ReferralSource, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>, token?: string): Promise<ReferralSource> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/referrals`, {
        method: 'POST',
        headers,
        body: JSON.stringify(referralData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create referral: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  }

  // Update referral source
  async updateReferral(id: string, referralData: Partial<ReferralSource>, token?: string): Promise<ReferralSource> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/referrals/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(referralData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update referral: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating referral:', error);
      throw error;
    }
  }

  // Delete referral source
  async deleteReferral(id: string, token?: string): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/referrals/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete referral: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting referral:', error);
      throw error;
    }
  }

  // Get doctor commission statements for a period
  async getDoctorCommissionStatements(
    params: { period?: string; commissionRate?: number; dueDate?: string } = {},
    token?: string
  ): Promise<{
    status: string;
    data: Array<{
      doctor: string;
      period: string;
      referrals: number;
      revenue: number;
      commission: number;
      status: 'draft' | 'sent' | 'paid';
      dueDate: string;
    }>;
  }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const query = new URLSearchParams();
      if (params.period) query.set('period', params.period);
      if (params.commissionRate !== undefined)
        query.set('commissionRate', String(params.commissionRate));
      if (params.dueDate) query.set('dueDate', params.dueDate);

      const url = `${BASE_URL}/api/v1/referrals/doctor-commission-statements${
        query.toString() ? `?${query.toString()}` : ''
      }`;

      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch commission statements: ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching commission statements:', error);
      throw error;
    }
  }
}

export const referralService = new ReferralService();
