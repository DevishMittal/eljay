/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  AppointmentsResponse,
  AppointmentResponse,
  CreateAppointmentData,
  AudiologistsResponse,
  ProceduresResponse
} from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class AppointmentService {
  // Get all appointments with pagination
  async getAppointments(page: number = 1, limit: number = 10, token?: string): Promise<AppointmentsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/appointments?page=${page}&limit=${limit}`, {
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

  // Get appointment by ID with summary
  async getAppointmentSummary(appointmentId: string, token?: string): Promise<AppointmentResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
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

  // Create new appointment
  async createAppointment(appointmentData: CreateAppointmentData, token?: string): Promise<AppointmentResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/appointments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(appointmentData),
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

  // Get available audiologists
  async getAvailableAudiologists(token?: string): Promise<AudiologistsResponse> {
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
        throw new Error(`Failed to fetch audiologists: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching audiologists:', error);
      throw error;
    }
  }

  // Get available procedures
  async getProcedures(token?: string): Promise<ProceduresResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
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

  // Helper function to format appointment date for display
  formatAppointmentDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  // Helper function to format appointment time for display
  formatAppointmentTime(timeString: string): string {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Helper function to convert time string to 24-hour format for API
  convertTo24Hour(time12: string): string {
    const [time, period] = time12.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Helper function to convert 24-hour format to 12-hour format for display
  convertTo12Hour(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  // Update appointment visit status
  async updateAppointmentStatus(appointmentId: string, visitStatus: 'check_in' | 'no_show' | 'absent', token?: string): Promise<AppointmentResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/appointments/${appointmentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ visitStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update appointment status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  // Get appointments by user ID
  async getAppointmentsByUserId(userId: string, token?: string): Promise<AppointmentsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch all appointments and filter by userId
      const response = await fetch(`${BASE_URL}/api/v1/appointments?page=1&limit=1000`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.statusText}`);
      }

      const appointmentsData = await response.json();
      
      // Filter appointments by userId
      const userAppointments = appointmentsData.data.appointments.filter(
        (appointment: any) => appointment.userId === userId
      );

      return {
        status: 'success',
        data: {
          appointments: userAppointments,
          pagination: {
            total: userAppointments.length,
            page: 1,
            limit: 1000,
            pages: 1
          }
        }
      };
    } catch (error) {
      console.error('Error fetching appointments by user ID:', error);
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService();