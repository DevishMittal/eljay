/* eslint-disable @typescript-eslint/no-explicit-any */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://eljay-api.vizdale.com/api/v1';

export interface OAEForm {
  id: string;
  organizationId: string;
  userId: string;
  audiologistId: string;
  patientName: string;
  patientId: string;
  classification: string;
  babyDateOfBirth: string;
  babyMotherName: string;
  babyGender: string;
  opNumber: string;
  contactNumber: string;
  hospitalName: string;
  doctorName: string;
  sessionNumber: number;
  testDate: string;
  conductedBy: string;
  testReason: string;
  equipmentUsed: string;
  testResults: string;
  testNotes: string;
  status: string;
  failedAttempts: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullname: string;
    email: string;
    phoneNumber: string;
  };
  audiologist?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    specialization: string;
  };
}

export interface OAEFormSummary {
  total: number;
  active: number;
  completed: number;
  passed: number;
  failed: number;
  referred: number;
}

export interface OAEFormResponse {
  oaeForms: OAEForm[];
  summary: OAEFormSummary;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateOAEFormData {
  userId: string;
  audiologistId: string;
  patientName: string;
  patientId: string;
  classification: string;
  babyDateOfBirth: string;
  babyMotherName: string;
  babyGender: string;
  opNumber: string;
  contactNumber: string;
  hospitalName: string;
  doctorName: string;
  sessionNumber: number;
  testDate: string;
  conductedBy: string;
  testReason: string;
  equipmentUsed: string;
  testResults: string;
  testNotes: string;
  failedAttempts: number;
}

class OAEFormService {
  private async makeRequest(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getOAEForms(token?: string): Promise<OAEFormResponse> {
    const url = `${API_BASE_URL}/oae-forms`;
    return this.makeRequest(url);
  }

  async getOAEFormsByUser(userId: string, token?: string): Promise<OAEFormResponse> {
    const url = `${API_BASE_URL}/oae-forms/user/${userId}`;
    return this.makeRequest(url);
  }

  async getOAEFormsByPatient(patientId: string, token?: string): Promise<OAEFormResponse> {
    const url = `${API_BASE_URL}/oae-forms/patient/${patientId}`;
    return this.makeRequest(url);
  }

  async createOAEForm(formData: CreateOAEFormData, token?: string): Promise<OAEForm> {
    const url = `${API_BASE_URL}/oae-forms`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async updateOAEForm(id: string, formData: Partial<CreateOAEFormData>, token?: string): Promise<OAEForm> {
    const url = `${API_BASE_URL}/oae-forms/${id}`;
    return this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
  }

  async deleteOAEForm(id: string, token?: string): Promise<void> {
    const url = `${API_BASE_URL}/oae-forms/${id}`;
    return this.makeRequest(url, {
      method: 'DELETE',
    });
  }

  async getOAEFormById(id: string, token?: string): Promise<OAEForm> {
    const url = `${API_BASE_URL}/oae-forms/${id}`;
    return this.makeRequest(url);
  }
}

export const oaeService = new OAEFormService();

