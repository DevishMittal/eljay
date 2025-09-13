import { 
  CreatePaymentData, 
  UpdatePaymentData, 
  PaymentsResponse, 
  PaymentResponse 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://eljay-api.vizdale.com/api/v1';

class PatientPaymentService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Get payments for a specific patient
  static async getPatientPayments(patientId: string): Promise<PaymentsResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch all payments since the API doesn't support patientId filtering
      const response = await fetch(`${API_BASE_URL}/payments`, {
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
      
      // Filter payments for the specific patient on the client side
      if (data.data && data.data.payments) {
        const filteredPayments = data.data.payments.filter((payment: { patientId: string }) => 
          payment.patientId === patientId
        );
        
        return {
          ...data,
          data: {
            ...data.data,
            payments: filteredPayments
          }
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching patient payments:', error);
      throw error;
    }
  }

  // Get all payments (for now, we'll filter by patient name on frontend)
  static async getAllPayments(page: number = 1, limit: number = 10): Promise<PaymentsResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/payments?page=${page}&limit=${limit}`, {
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

  // Get single payment by ID
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

  // Create new payment for patient
  static async createPayment(paymentData: CreatePaymentData): Promise<PaymentResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Update existing payment
  static async updatePayment(id: string, updateData: UpdatePaymentData): Promise<PaymentResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  // Delete payment
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
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  // Helper method to format date for API
  static formatDateForAPI(date: string): string {
    if (!date) return '';
    // Convert date to YYYY-MM-DD format
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  // Helper method to format date for display
  static formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Helper method to get payment method color
  static getMethodColor(method: string): string {
    switch (method) {
      case 'Cash':
        return 'bg-green-100 text-green-800';
      case 'Card':
        return 'bg-blue-100 text-blue-800';
      case 'UPI':
        return 'bg-purple-100 text-purple-800';
      case 'Bank Transfer':
        return 'bg-indigo-100 text-indigo-800';
      case 'Cheque':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Helper method to get payment status color
  static getStatusColor(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Helper method to get payment type color
  static getPaymentTypeColor(type: string): string {
    switch (type) {
      case 'Full':
        return 'bg-green-100 text-green-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

export default PatientPaymentService;
