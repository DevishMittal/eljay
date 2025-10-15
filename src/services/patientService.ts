/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  CreateUserData, 
  UpdateUserData, 
  PatientsResponse, 
  PatientResponse, 
  UserLookupResponse,
  UserCreateResponse,
  UsersResponse,
  UserResponse,
  UserAppointmentsResponse,
  Patient
} from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class PatientService {
  // Lookup user by phone number only
  async lookupUser(phoneNumber: string, token?: string): Promise<UserLookupResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/users/lookup?phone=${phoneNumber}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        // Parse the error response to preserve the original error details
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(`Failed to lookup user: ${response.statusText}`);
        // Attach the original response data to the error object
        (error as any).response = {
          data: errorData,
          status: response.status,
          statusText: response.statusText
        };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error looking up user:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData: CreateUserData, token?: string): Promise<UserCreateResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        // Parse the error response to preserve the original error details
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(`Failed to create user: ${response.statusText}`);
        // Attach the original response data to the error object
        (error as any).response = {
          data: errorData,
          status: response.status,
          statusText: response.statusText
        };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get all users directly (for payment forms)
  async getUsers(page: number = 1, limit: number = 10, token?: string): Promise<UsersResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/users?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get all users as patients
  async getPatients(page: number = 1, limit: number = 10, token?: string): Promise<PatientsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/users?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const usersResponse: UsersResponse = await response.json();
      
      // Convert users to patients format for compatibility
      const patients: Patient[] = usersResponse.data.users.map(user => ({
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
        countrycode: user.countrycode,
        hospital_name: user.hospitalName,
        opipNumber: user.opipNumber // OP/IP number for B2B patients
      }));

      return {
        status: 'success',
        patients: patients,
        pagination: {
          page: usersResponse.data.pagination.page,
          limit: usersResponse.data.pagination.limit,
          total: usersResponse.data.pagination.total,
          totalPages: usersResponse.data.pagination.totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  // Get individual user/patient by user ID (cross-branch access)
  async getPatientById(userId: string, token?: string): Promise<PatientResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Use the new cross-branch patient endpoint
      const response = await fetch(`${BASE_URL}/api/v1/patient-transfers/patients/${userId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      const userResponse: UserResponse = await response.json();
      const user = userResponse.data;
      
      // Convert user to patient format for compatibility
      const patient: Patient = {
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
        countrycode: user.countrycode,
        hospital_name: user.hospitalName,
        opipNumber: user.opipNumber, // OP/IP number for B2B patients
        // Include cross-branch access data if available
        branch: (user as any).branch || null,
        transfersMade: (user as any).transfersMade || []
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

  // Update user
  async updateUser(userId: string, userData: UpdateUserData, token?: string): Promise<UserResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Transform field names to match API expectations
      const transformedData: any = {};
      
      // Map frontend field names to backend field names
      Object.keys(userData).forEach(key => {
        const value = (userData as any)[key];
        switch (key) {
          case 'full_name':
            transformedData.fullname = value;
            break;
          case 'mobile_number':
            transformedData.phoneNumber = value;
            break;
          case 'email_address':
            transformedData.email = value;
            break;
          case 'alternative_number':
            transformedData.alternateNumber = value;
            break;
          case 'hospital_name':
            transformedData.hospitalName = value;
            break;
          case 'opipNumber':
            transformedData.opipNumber = value;
            break;
          default:
            transformedData[key] = value;
            break;
        }
      });

      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId: string, token?: string): Promise<{ success: boolean }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
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

  // Get user appointments using main appointments API filtered by userId
  async getUserAppointments(userId: string, token?: string): Promise<UserAppointmentsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Use main appointments API with high limit to get all appointments, then filter by userId
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

      // Transform the data to match UserAppointmentsResponse format
      const transformedAppointments = userAppointments.map((appointment: any) => ({
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        appointmentDuration: appointment.appointmentDuration,
        procedures: appointment.procedures,
        visitStatus: appointment.visitStatus,
        referralSource: appointment.referralSource,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        audiologist: appointment.audiologist
      }));

      return {
        status: 'success',
        data: {
          total: transformedAppointments.length,
          appointments: transformedAppointments
        }
      };
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

  // Legacy methods for backward compatibility
  async createPatient(patientData: any, token?: string): Promise<any> {
    // Redirect to createUser for backward compatibility
    return this.createUser(patientData, token);
  }

  async updatePatient(patientId: string, patientData: any, token?: string): Promise<any> {
    // Redirect to updateUser for backward compatibility
    return this.updateUser(patientId, patientData, token);
  }

  async deletePatient(patientId: string, token?: string): Promise<{ success: boolean }> {
    // Redirect to deleteUser for backward compatibility
    return this.deleteUser(patientId, token);
  }

  // Check if a B2B patient profile is complete
  static isProfileComplete(patient: Patient): boolean {
    if (patient.type !== 'B2B') {
      return true; // B2C patients don't need OP/IP number
    }
    
    // B2B patients need OP/IP number for complete profile
    return !!(patient.opipNumber && patient.opipNumber.trim() !== '');
  }

  // Get incomplete B2B patients (missing OP/IP number)
  static getIncompleteB2BPatients(patients: Patient[]): Patient[] {
    return patients.filter(patient => 
      patient.type === 'B2B' && !this.isProfileComplete(patient)
    );
  }

  // Get patients by hospital name using individual user API calls
  async getPatientsByHospital(hospitalName: string, token?: string): Promise<Patient[]> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // First, get all users to get their IDs
      const response = await fetch(`${BASE_URL}/api/v1/users?limit=1000`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const usersResponse: UsersResponse = await response.json();
      const users = usersResponse.data.users;
      
      // Filter for B2B users only to reduce API calls
      const b2bUsers = users.filter(user => user.customerType === 'B2B');
      
      // For each B2B user, get detailed info to check hospital name
      const hospitalPatients: Patient[] = [];
      
      for (const user of b2bUsers) {
        try {
          const userDetailResponse = await fetch(`${BASE_URL}/api/v1/users/${user.id}`, {
            method: 'GET',
            headers,
          });

          if (userDetailResponse.ok) {
            const userDetail: UserResponse = await userDetailResponse.json();
            const detailedUser = userDetail.data;
            
            // Check if this user belongs to the selected hospital
            if (detailedUser.hospitalName === hospitalName) {
              hospitalPatients.push({
                id: detailedUser.id,
                patient_id: detailedUser.id,
                full_name: detailedUser.fullname,
                mobile_number: detailedUser.phoneNumber,
                email_address: detailedUser.email,
                dob: detailedUser.dob,
                gender: detailedUser.gender as 'Male' | 'Female',
                occupation: detailedUser.occupation,
                type: detailedUser.customerType,
                status: 'Active' as const,
                created_at: detailedUser.createdAt,
                updated_at: detailedUser.updatedAt,
                alternative_number: detailedUser.alternateNumber,
                countrycode: detailedUser.countrycode,
                hospital_name: detailedUser.hospitalName,
                opipNumber: detailedUser.opipNumber // OP/IP number for B2B patients
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching details for user ${user.id}:`, error);
          // Continue with other users even if one fails
        }
      }

      return hospitalPatients;
    } catch (error) {
      console.error('Error fetching patients by hospital:', error);
      throw error;
    }
  }
}

export const patientService = new PatientService();
export default PatientService;

