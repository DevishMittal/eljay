import { 
  DoctorsResponse,
  DoctorSingleResponse,
  CreateDoctorData,
  UpdateDoctorData
} from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class DoctorService {
  // Get all doctors
  async getDoctors(token?: string): Promise<DoctorsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/audiologists`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch doctors: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  }

  // Create new doctor
  async createDoctor(doctorData: CreateDoctorData, token?: string): Promise<DoctorSingleResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/audiologists`, {
        method: 'POST',
        headers,
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create doctor: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
  }

  // Update doctor
  async updateDoctor(id: string, doctorData: UpdateDoctorData, token?: string): Promise<DoctorSingleResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/audiologists/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update doctor: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating doctor:', error);
      throw error;
    }
  }

  // Get available audiologists
  async getAvailableAudiologists(token?: string): Promise<DoctorsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/audiologists/available`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch available audiologists: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available audiologists:', error);
      throw error;
    }
  }

  // Delete doctor
  async deleteDoctor(id: string, token?: string): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/audiologists/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete doctor: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      throw error;
    }
  }
}

export const doctorService = new DoctorService();
