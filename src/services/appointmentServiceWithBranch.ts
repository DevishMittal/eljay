/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  AppointmentsResponse,
  AppointmentResponse,
  CreateAppointmentData,
  UpdateAppointmentData,
  AudiologistsResponse,
  ProceduresResponse
} from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class AppointmentServiceWithBranch {
  // Get all appointments with pagination and branch filtering
  async getAppointments(
    page: number = 1, 
    limit: number = 10, 
    token?: string,
    branchId?: string | null
  ): Promise<AppointmentsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add branchId if provided (for SuperAdmin filtering)
      if (branchId) {
        queryParams.append('branchId', branchId);
      }

      const response = await fetch(`${BASE_URL}/api/v1/appointments?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  // Get appointments by date with branch filtering
  async getAppointmentsByDate(
    date: string,
    token?: string,
    branchId?: string | null
  ): Promise<AppointmentsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        date,
      });

      // Add branchId if provided
      if (branchId) {
        queryParams.append('branchId', branchId);
      }

      const response = await fetch(`${BASE_URL}/api/v1/appointments?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments by date: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      throw error;
    }
  }

  // Get appointments by audiologist with branch filtering
  async getAppointmentsByAudiologist(
    audiologistId: string,
    page: number = 1,
    limit: number = 10,
    token?: string,
    branchId?: string | null
  ): Promise<AppointmentsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        audiologistId,
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add branchId if provided
      if (branchId) {
        queryParams.append('branchId', branchId);
      }

      const response = await fetch(`${BASE_URL}/api/v1/appointments?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments by audiologist: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments by audiologist:', error);
      throw error;
    }
  }

  // Create appointment (no branch filtering needed as it's based on user's organization)
  async createAppointment(data: CreateAppointmentData, token?: string): Promise<AppointmentResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/appointments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create appointment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  // Update appointment (no branch filtering needed)
  async updateAppointment(
    appointmentId: string,
    data: UpdateAppointmentData,
    token?: string
  ): Promise<AppointmentResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update appointment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  // Delete appointment (no branch filtering needed)
  async deleteAppointment(appointmentId: string, token?: string): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete appointment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  // Get appointment summary (no branch filtering needed as it's by ID)
  async getAppointmentSummary(appointmentId: string, token?: string): Promise<AppointmentResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/appointments/${appointmentId}/summary`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch appointment summary: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching appointment summary:', error);
      throw error;
    }
  }

  // Get available audiologists with branch filtering
  async getAvailableAudiologists(
    token?: string,
    branchId?: string | null
  ): Promise<AudiologistsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add branchId if provided
      if (branchId) {
        queryParams.append('branchId', branchId);
      }

      const url = queryParams.toString() 
        ? `${BASE_URL}/api/v1/audiologists/available?${queryParams.toString()}`
        : `${BASE_URL}/api/v1/audiologists/available`;

      const response = await fetch(url, {
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

  // Get procedures (no branch filtering needed)
  async getProcedures(token?: string): Promise<ProceduresResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/procedures`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch procedures: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching procedures:', error);
      throw error;
    }
  }

  // Get hospital names with branch filtering
  async getHospitalNames(
    token?: string,
    branchId?: string | null
  ): Promise<{ status: string; data: { hospitals: string[]; count: number } }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add branchId if provided
      if (branchId) {
        queryParams.append('branchId', branchId);
      }

      const url = queryParams.toString() 
        ? `${BASE_URL}/api/v1/appointments/hospitals?${queryParams.toString()}`
        : `${BASE_URL}/api/v1/appointments/hospitals`;

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch hospital names: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching hospital names:', error);
      throw error;
    }
  }
}

const appointmentServiceWithBranch = new AppointmentServiceWithBranch();
export default appointmentServiceWithBranch;

