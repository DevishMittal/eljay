/* eslint-disable @typescript-eslint/no-explicit-any */
import { Patient } from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

export interface SearchResult {
  id: string;
  patient_id: string;
  full_name: string;
  mobile_number: string;
  email_address: string;
  gender: 'Male' | 'Female';
  age?: number;
  type?: string;
  status?: string;
  hospital_name?: string;
  opipNumber?: string;
}

export interface SearchResponse {
  status: string;
  data: SearchResult[];
  total: number;
}

class SearchService {
  // Search patients using the available API endpoints
  async searchPatients(query: string, token?: string): Promise<SearchResponse> {
    if (!query.trim()) {
      return {
        status: 'success',
        data: [],
        total: 0
      };
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // First, try to search by phone number if the query looks like a phone number
      if (this.isPhoneNumber(query)) {
        try {
          const phoneResponse = await fetch(`${BASE_URL}/api/v1/users/lookup?phone=${encodeURIComponent(query.trim())}`, {
            method: 'GET',
            headers,
          });

          if (phoneResponse.ok) {
            const phoneResult = await phoneResponse.json();
            if (phoneResult.status === 'success' && phoneResult.data) {
              const searchResults: SearchResult[] = [this.mapUserToSearchResult(phoneResult.data)];
              return {
                status: 'success',
                data: searchResults,
                total: searchResults.length
              };
            }
          }
        } catch (phoneError) {
          console.log('Phone lookup failed, falling back to general search:', phoneError);
        }
      }

      // Fallback to general search by fetching users and filtering client-side
      return await this.searchPatientsFallback(query, token);
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  // Search patients by fetching users and filtering client-side
  async searchPatientsFallback(query: string, token?: string): Promise<SearchResponse> {
    if (!query.trim()) {
      return {
        status: 'success',
        data: [],
        total: 0
      };
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Get users from the API
      const response = await fetch(`${BASE_URL}/api/v1/users?page=1&limit=50`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Check if the response has the expected structure
      if (result.status !== 'success' || !result.data || !result.data.users) {
        throw new Error('Invalid API response structure');
      }

      const users = result.data.users || [];
      
      // Filter users based on search query
      const filteredUsers = users.filter((user: any) => {
        const searchTerm = query.toLowerCase();
        const fullName = (user.fullname || '').toLowerCase();
        const mobileNumber = (user.phoneNumber || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const userId = (user.id || '').toLowerCase();
        
        return fullName.includes(searchTerm) || 
               mobileNumber.includes(searchTerm) || 
               email.includes(searchTerm) ||
               userId.includes(searchTerm);
      });

      const searchResults: SearchResult[] = filteredUsers.slice(0, 10).map((user: any) => 
        this.mapUserToSearchResult(user)
      );

      return {
        status: 'success',
        data: searchResults,
        total: searchResults.length
      };
    } catch (error) {
      console.error('Error in fallback search:', error);
      throw error;
    }
  }

  // Helper method to map user data to search result format
  private mapUserToSearchResult(user: any): SearchResult {
    return {
      id: user.id,
      patient_id: user.id, // Using user ID as patient ID since there's no separate patient_id field
      full_name: user.fullname || '',
      mobile_number: user.phoneNumber || '',
      email_address: user.email || '',
      gender: user.gender || 'Male',
      age: user.age,
      type: user.customerType || 'B2C',
      status: user.status,
      hospital_name: user.hospitalName || '',
      opipNumber: user.opipNumber || ''
    };
  }

  // Helper method to check if query looks like a phone number
  private isPhoneNumber(query: string): boolean {
    // Remove spaces, dashes, and parentheses
    const cleaned = query.replace(/[\s\-\(\)]/g, '');
    // Check if it's mostly digits and has reasonable length
    return /^\d+$/.test(cleaned) && cleaned.length >= 7 && cleaned.length <= 15;
  }
}

export const searchService = new SearchService();
