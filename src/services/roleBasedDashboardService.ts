import { RoleBasedDashboardResponse } from '@/types';

const API_BASE_URL = 'https://eljay-api.vizdale.com/api/v1';

export class RoleBasedDashboardService {
  private static getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async getRoleBasedDashboard(token: string): Promise<RoleBasedDashboardResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching role-based dashboard:', error);
      throw error;
    }
  }

  static async getSuperAdminDashboard(
    token: string, 
    sections: string[] = ['revenueAnalytics'],
    startDate?: string,
    endDate?: string
  ): Promise<RoleBasedDashboardResponse> {
    try {
      const queryParams = new URLSearchParams({
        sections: sections.join(','),
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await fetch(`${API_BASE_URL}/super-admin/dashboard?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching super admin dashboard:', error);
      throw error;
    }
  }
}
