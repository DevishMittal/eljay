/* eslint-disable @typescript-eslint/no-explicit-any */
import { OutstandingPaymentsResponse } from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class OutstandingPaymentsService {
  async getOutstandingPayments(patientId: string, token?: string): Promise<OutstandingPaymentsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/payments/outstanding/${patientId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch outstanding payments: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching outstanding payments:', error);
      throw error;
    }
  }
}

export default new OutstandingPaymentsService();
