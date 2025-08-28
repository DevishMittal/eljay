import { 
  Patient, 
  CreatePatientData, 
  UpdatePatientData, 
  PatientsResponse, 
  PatientResponse, 
  PatientUpdateResponse 
} from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class PatientService {
  // Get all patients with pagination
  async getPatients(page: number = 1, limit: number = 10): Promise<PatientsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/patients?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patients: ${response.statusText}`);
      }

      return await response.json();
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

  // Create new patient
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

