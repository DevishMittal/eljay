import { 
  StaffResponse,
  StaffSingleResponse,
  CreateStaffData,
  UpdateStaffData
} from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class StaffService {
  // Get all staff
  async getStaff(token?: string): Promise<StaffResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/organizations/staff`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch staff: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  }

  // Create new staff member
  async createStaff(staffData: CreateStaffData, token?: string): Promise<StaffSingleResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/organizations/staff`, {
        method: 'POST',
        headers,
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create staff member: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating staff member:', error);
      throw error;
    }
  }

  // Update staff member
  async updateStaff(id: string, staffData: UpdateStaffData, token?: string): Promise<StaffSingleResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/organizations/staff/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update staff member: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating staff member:', error);
      throw error;
    }
  }

  // Delete staff member
  async deleteStaff(id: string, token?: string): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/organizations/staff/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete staff member: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting staff member:', error);
      throw error;
    }
  }
}

export const staffService = new StaffService();
