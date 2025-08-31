import { 
  CreatePatientData, 
  UpdatePatientData, 
  PatientsResponse, 
  PatientResponse, 
  PatientUpdateResponse,
  UserLookupResponse,
  CreateUserData,
  UserCreateResponse,
  UsersResponse,
  UserResponse,
  UserAppointmentsResponse
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

  // Get all users as patients
  async getPatients(page: number = 1, limit: number = 10): Promise<PatientsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const usersResponse: UsersResponse = await response.json();
      
      // Convert users to patients format for compatibility
      const patients = usersResponse.data.map(user => ({
        id: user.id,
        patient_id: user.id,
        full_name: user.fullname,
        mobile_number: user.phoneNumber,
        email_address: user.email,
        dob: user.dob,
        gender: user.gender as 'Male' | 'Female',
        occupation: user.occupation,
        type: user.customerType,
        status: 'Active', // Default status
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        alternative_number: user.alternateNumber,
        countrycode: user.countrycode
      }));

      // Simple pagination (since API doesn't support it yet)
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPatients = patients.slice(startIndex, endIndex);
      
      return {
        status: 'success',
        patients: paginatedPatients,
        pagination: {
          page: page,
          limit: limit,
          total: patients.length,
          totalPages: Math.ceil(patients.length / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  // Get individual user/patient by user ID
  async getPatientById(userId: string): Promise<PatientResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      const userResponse: UserResponse = await response.json();
      const user = userResponse.data;
      
      // Convert user to patient format for compatibility
      const patient = {
        id: user.id,
        patient_id: user.id,
        full_name: user.fullname,
        mobile_number: user.phoneNumber,
        email_address: user.email,
        dob: user.dob,
        gender: user.gender as 'Male' | 'Female',
        occupation: user.occupation,
        type: user.customerType,
        status: 'Active', // Default status
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        alternative_number: user.alternateNumber,
        countrycode: user.countrycode
      };

      return {
        status: 'success',
        patient: patient
      };
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

  // Get user appointments
  async getUserAppointments(userId: string): Promise<UserAppointmentsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}/appointments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user appointments: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user appointments:', error);
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
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}

export const patientService = new PatientService();

