const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://eljay-api.vizdale.com/api/v1';

export interface OAEForm {
  id: string;
  organizationId: string;
  userId: string;
  audiologistId?: string; // deprecated: use staffId going forward
  staffId?: string;
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
  status: string;
  data: {
    oaeForms: OAEForm[];
    summary: OAEFormSummary;
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface CreateOAEFormData {
  userId: string;
  audiologistId?: string; // deprecated: use staffId going forward
  staffId?: string;
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
  private async makeRequest(url: string, options: RequestInit = {}, token?: string) {
    const authToken = token || localStorage.getItem('token');
    
    if (!authToken) {
      throw new Error('No authentication token provided');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
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
    return this.makeRequest(url, {}, token);
  }

  async getOAEFormsByUser(userId: string, token?: string): Promise<OAEFormResponse> {
    const url = `${API_BASE_URL}/oae-forms/user/${userId}`;
    return this.makeRequest(url, {}, token);
  }

  async getOAEFormsByPatient(userId: string, token?: string): Promise<OAEFormResponse> {
    // Use the correct user endpoint since patientId is the userId
    const url = `${API_BASE_URL}/oae-forms/user/${userId}`;
    return this.makeRequest(url, {}, token);
  }

  async createOAEForm(formData: CreateOAEFormData, token?: string): Promise<OAEForm> {
    const url = `${API_BASE_URL}/oae-forms`;
    const response = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(formData),
    }, token);
    return response.data;
  }

  async updateOAEForm(id: string, formData: Partial<CreateOAEFormData>, token?: string): Promise<OAEForm> {
    const url = `${API_BASE_URL}/oae-forms/${id}`;
    
    // Remove userId, audiologistId, and staffId from the update payload as per API requirement
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, audiologistId, staffId, ...updatePayload } = formData;
    
    const response = await this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    }, token);
    return response.data;
  }

  async deleteOAEForm(id: string, token?: string): Promise<void> {
    const url = `${API_BASE_URL}/oae-forms/${id}`;
    await this.makeRequest(url, {
      method: 'DELETE',
    }, token);
  }

  async getOAEFormById(id: string, token?: string): Promise<OAEForm> {
    const url = `${API_BASE_URL}/oae-forms/${id}`;
    const response = await this.makeRequest(url, {}, token);
    return response.data;
  }
}

export const oaeService = new OAEFormService();

