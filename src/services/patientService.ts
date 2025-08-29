import { 
  CreatePatientData, 
  UpdatePatientData, 
  PatientsResponse, 
  PatientResponse, 
  PatientUpdateResponse,
  UserLookupResponse,
  CreateUserData,
  UserCreateResponse
} from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class PatientService {
  // Lookup user by phone number only
  async lookupUser(phoneNumber: string): Promise<UserLookupResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/users/lookup?phone=${phoneNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to lookup user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error looking up user:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData: CreateUserData): Promise<UserCreateResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get all users as patients - since there's no direct patients endpoint, we'll need to implement this differently
  // For now, we'll create a mock response structure until you provide a users list endpoint
  async getPatients(page: number = 1, limit: number = 10): Promise<PatientsResponse> {
    try {
      // Since there's no direct endpoint to get all users, we'll return a mock structure
      // You may need to implement a GET /api/v1/users endpoint on your backend
      // For now, returning empty structure to prevent 404 errors
      const mockResponse: PatientsResponse = {
        status: 'success',
        patients: [], // Empty for now since we don't have a users list endpoint
        pagination: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0
        }
      };
      
      return mockResponse;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  // Get individual patient by patient_id
  async getPatientById(patientId: string): Promise<PatientResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/patients/${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patient: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  // Create new patient (keeping for backward compatibility)
  async createPatient(patientData: CreatePatientData): Promise<PatientResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create patient: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  // Update patient
  async updatePatient(patientId: string, patientData: UpdatePatientData): Promise<PatientUpdateResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update patient: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  // Delete patient
  async deletePatient(patientId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${BASE_URL}/api/patients/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete patient: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  // Calculate age from date of birth
  calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
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
}

export const patientService = new PatientService();

