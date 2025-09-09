import { HospitalsResponse, HospitalResponse, CreateHospitalData, UpdateHospitalData } from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class HospitalService {
  async getHospitals(token?: string): Promise<HospitalsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/hospitals`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch hospitals: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      throw error;
    }
  }

  async getHospital(id: string, token?: string): Promise<HospitalResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/hospitals/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch hospital: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching hospital:', error);
      throw error;
    }
  }

  async createHospital(data: CreateHospitalData, token?: string): Promise<HospitalResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/hospitals`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create hospital: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating hospital:', error);
      throw error;
    }
  }

  async updateHospital(id: string, data: UpdateHospitalData, token?: string): Promise<HospitalResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/hospitals/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update hospital: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating hospital:', error);
      throw error;
    }
  }

  async deleteHospital(id: string, token?: string): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/hospitals/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete hospital: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting hospital:', error);
      throw error;
    }
  }
}

const hospitalService = new HospitalService();
export default hospitalService;
