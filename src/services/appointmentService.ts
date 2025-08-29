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
  async getAppointments(page: number = 1, limit: number = 10): Promise<AppointmentsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/appointments?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
  async getAppointmentSummary(appointmentId: string): Promise<AppointmentResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/appointments/${appointmentId}/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
  async createAppointment(appointmentData: CreateAppointmentData): Promise<AppointmentResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
  async getAvailableAudiologists(): Promise<AudiologistsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/audiologists/available`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
  async getProcedures(): Promise<ProceduresResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/procedures`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
}

export const appointmentService = new AppointmentService();