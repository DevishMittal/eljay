import { 
  PaymentsResponse, 
  PaymentResponse, 
  Payment, 
  CreatePaymentData, 
  UpdatePaymentData,
  OutstandingPaymentsResponse
} from '@/types';

const API_BASE_URL = 'https://eljay-api.vizdale.com/api/v1';

class PaymentService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async getPayments(page: number = 1, limit: number = 10, branchId?: string | null): Promise<PaymentsResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add branchId if provided
      if (branchId) {
        queryParams.append('branchId', branchId);
      }

      const response = await fetch(`${API_BASE_URL}/payments?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message === 'Invalid token') {
          throw new Error('Authentication token is invalid or expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  static async getPayment(id: string): Promise<PaymentResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message === 'Invalid token') {
          throw new Error('Authentication token is invalid or expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  static async createPayment(paymentData: CreatePaymentData): Promise<PaymentResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message === 'Invalid token') {
          throw new Error('Authentication token is invalid or expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  static async updatePayment(id: string, paymentData: UpdatePaymentData): Promise<PaymentResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message === 'Invalid token') {
          throw new Error('Authentication token is invalid or expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  static async deletePayment(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message === 'Invalid token') {
          throw new Error('Authentication token is invalid or expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  static async getOutstandingPayments(patientId: string): Promise<OutstandingPaymentsResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/payments/outstanding/${patientId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message === 'Invalid token') {
          throw new Error('Authentication token is invalid or expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching outstanding payments:', error);
      throw error;
    }
  }

  // Utility methods for date formatting
  static formatDateForAPI(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  }

  static formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options); // Returns "DD Mon YYYY"
  }

  static formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString()}`;
  }
}

export default PaymentService;
