import { 
  DiagnosticAppointmentsResponse,
  DiagnosticAppointment,
  CreateDiagnosticAppointmentData
} from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class DiagnosticAppointmentsService {
  // Get all diagnostic appointments
  async getDiagnosticAppointments(token?: string): Promise<DiagnosticAppointmentsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/diagnostic-appointments`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch diagnostic appointments: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the API response to match our DiagnosticAppointment interface
      const transformedAppointments = data.data.appointments.map((appointment: Record<string, unknown>) => {
        const audiologist = appointment.audiologist as Record<string, unknown> | undefined;
        return {
          ...appointment,
          status: 'planned' as const, // Default status since API doesn't provide it
          cost: 0, // Default cost since API doesn't provide it
          assignedDoctor: audiologist?.name as string || 'Unassigned',
          files: 0, // Default files count since API doesn't provide it
          // appointmentDate is already provided by the API and should be used as planned date
        };
      });

      return {
        status: data.status,
        data: {
          appointments: transformedAppointments,
          pagination: data.data.pagination
        }
      };
    } catch (error) {
      console.error('Error fetching diagnostic appointments:', error);
      throw error;
    }
  }

  // Get diagnostic appointment by ID
  async getDiagnosticAppointmentById(id: string, token?: string): Promise<DiagnosticAppointment> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/diagnostic-appointments/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch diagnostic appointment: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the API response to match our DiagnosticAppointment interface
      const appointment = data.data;
      const audiologist = appointment.audiologist as Record<string, unknown> | undefined;
      return {
        ...appointment,
        status: 'planned' as const, // Default status since API doesn't provide it
        cost: 0, // Default cost since API doesn't provide it
        assignedDoctor: audiologist?.name as string || 'Unassigned',
        files: 0, // Default files count since API doesn't provide it
        // appointmentDate is already provided by the API and should be used as planned date
      };
    } catch (error) {
      console.error('Error fetching diagnostic appointment:', error);
      throw error;
    }
  }

  // Create new diagnostic appointment
  async createDiagnosticAppointment(appointmentData: CreateDiagnosticAppointmentData, token?: string): Promise<DiagnosticAppointment> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/diagnostic-appointments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create diagnostic appointment: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating diagnostic appointment:', error);
      throw error;
    }
  }

  // Update diagnostic appointment
  async updateDiagnosticAppointment(id: string, appointmentData: Partial<CreateDiagnosticAppointmentData>, token?: string): Promise<DiagnosticAppointment> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/diagnostic-appointments/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update diagnostic appointment: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating diagnostic appointment:', error);
      throw error;
    }
  }

  // Delete diagnostic appointment
  async deleteDiagnosticAppointment(id: string, token?: string): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/diagnostic-appointments/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete diagnostic appointment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting diagnostic appointment:', error);
      throw error;
    }
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Format time for display
  formatTime(timeString: string): string {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Get status color class
  getStatusColor(status: string): string {
    switch (status) {
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

export const diagnosticAppointmentsService = new DiagnosticAppointmentsService();
