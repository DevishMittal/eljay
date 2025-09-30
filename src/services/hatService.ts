const BASE_URL = 'https://eljay-api.vizdale.com';

export interface HATFormData {
  // Audiologist Information
  conductingAudiologist: string;
  staffId?: string;
  
  // Assessment Information
  hearingDifficultiesPerception: 'Yes' | 'No';
  needForHearingAids: 'Yes' | 'No'; 
  dexterityIssues: 'Yes' | 'No';
  previousHearingAidExposure: 'Yes' | 'No';
  visionProblems: 'Yes' | 'No';
  smartphoneUsageFrequency: 'Often' | 'Sometimes' | 'Rarely' | 'Never';
  additionalComments: string;
  
  // Preferences Information
  priority1Situation: string;
  priority2Situation: string;
  priority3Situation: string;
  preferredEnvironments: string[];
  
  // Trial Information
  trialConducted: 'Yes' | 'No';
  
  // Order Information
  manufacturer: string;
  style: string;
  color: string;
  hearingAidType: string;
  model: string;
  earImpressionsTaken: 'Yes' | 'No';
  
  // Plan Information
  patientDecision: string;
  aphabProvided: 'Yes' | 'No';
  
  // Follow-up Information
  followUpPlanningType: 'HAT - Lead Management' | 'HAF - Hearing Aid Fitting' | 'HA Advance Paid';
  
  // Lead Management
  leadType: 'Closed' | 'In Progress';
  reasonsForInProcess: string;
  nextFollowUpDate: string;
  additionalRemarks: string;
  
  // HAF (Hearing Aid Fitting) - Optional
  manufacturerName?: string;
  styleHaf?: string;
  modelHaf?: string;
  leftSerial?: string;
  rightSerial?: string;
  mrp?: number;
  dateOfBilling?: string;
  firstReviewDate?: string;
  discountedRate?: number;
  rechargeable?: 'Yes' | 'No';
  additionalCommentsHaf?: string;
  
  // HA Advance Paid - Optional
  amountPaid?: number;
  mrpAdvance?: number;
  modelAdvance?: string;
  reasonsForNotPurchase?: string;
  receipt?: string;
  manufacturerNameAdvance?: string;
  colorAdvance?: string;
}

export interface HearingAidTrial {
  id: string;
  hearingAidType: string;
  manufacturer: string;
  priceQuoted: number;
  styleAndTechnologyLevel: string;
}

export interface HATFormResponse {
  status: string;
  data: HATFormData & {
    id: string;
    organizationId: string;
    userId: string;
    audiologistId: string; // deprecated: use staffId going forward
    staffId?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      fullname: string;
      email: string;
      phoneNumber: string;
    };
    audiologist: {
      id: string;
      name: string;
      email: string;
      phoneNumber: string;
      specialization: string;
    };
    organization: {
      id: string;
      name: string;
    };
  };
}

export interface HATFormsListResponse {
  status: string;
  data: {
    hatForms: (HATFormData & {
      id: string;
      organizationId: string;
      userId: string;
      audiologistId: string; // deprecated: use staffId going forward
      staffId?: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      user: {
        id: string;
        fullname: string;
        email: string;
        phoneNumber: string;
      };
      audiologist: {
        id: string;
        name: string;
        email: string;
        phoneNumber: string;
        specialization: string;
      };
    })[];
    summary: {
      total: number;
      active: number;
      completed: number;
      cancelled: number;
      proceedingWithPurchase: number;
      wantsToDiscuss: number;
      notInterested: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

class HATService {
  // Create HAT form
  async createHATForm(data: HATFormData, token: string): Promise<HATFormResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/hat-forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create HAT form: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating HAT form:', error);
      throw error;
    }
  }

  // Get HAT forms
  async getHATForms(token: string): Promise<HATFormsListResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/hat-forms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch HAT forms: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching HAT forms:', error);
      throw error;
    }
  }

  // Get HAT form by ID
  async getHATFormById(id: string, token: string): Promise<HATFormResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/hat-forms/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch HAT form: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching HAT form:', error);
      throw error;
    }
  }

  // Update HAT form
  async updateHATForm(id: string, data: Partial<HATFormData>, token: string): Promise<HATFormResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/hat-forms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update HAT form: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating HAT form:', error);
      throw error;
    }
  }
}

export const hatService = new HATService();
