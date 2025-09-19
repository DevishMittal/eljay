import { Organization } from '@/types';

const API_BASE_URL = 'https://eljay-api.vizdale.com/api/v1';

interface OrganizationProfileResponse {
  status: string;
  data: Organization;
}

interface UpdateOrganizationData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  countrycode: string;
  website: string;
  gstNumber: string;
  address: string;
  logo: string;
}

export class OrganizationService {
  static async getProfile(token: string): Promise<OrganizationProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch organization profile: ${response.status} ${response.statusText}`);
      }

      const data: OrganizationProfileResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Get organization profile error:', error);
      throw error;
    }
  }

  static async updateProfile(token: string, profileData: UpdateOrganizationData): Promise<OrganizationProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update organization profile: ${response.status} ${response.statusText}`);
      }

      const data: OrganizationProfileResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Update organization profile error:', error);
      throw error;
    }
  }
}