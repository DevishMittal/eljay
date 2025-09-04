import { 
  Invoice, 
  CreateInvoiceData, 
  UpdateInvoiceData, 
  InvoicesResponse, 
  InvoiceResponse 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://eljay-api.vizdale.com/api/v1';

class PatientInvoiceService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Get invoices for a specific patient
  static async getPatientInvoices(patientId: string): Promise<InvoicesResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/invoices?patientId=${patientId}`, {
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
      console.error('Error fetching patient invoices:', error);
      throw error;
    }
  }

  // Get all invoices (for now, we'll filter by patient name on frontend)
  static async getAllInvoices(): Promise<InvoicesResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/invoices`, {
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
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  // Get single invoice by ID
  static async getInvoice(id: string): Promise<InvoiceResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
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
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  // Create new invoice for patient
  static async createInvoice(invoiceData: CreateInvoiceData): Promise<InvoiceResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Update existing invoice
  static async updateInvoice(id: string, updateData: UpdateInvoiceData): Promise<InvoiceResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
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
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  // Delete invoice
  static async deleteInvoice(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
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
      console.error('Error deleting invoice:', error);
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

  // Helper method to calculate invoice totals
  static calculateInvoiceTotals(screenings: any[], sgstRate: number, cgstRate: number) {
    const subtotal = screenings.reduce((sum, screening) => sum + screening.amount, 0);
    const totalDiscount = screenings.reduce((sum, screening) => sum + (screening.discount || 0), 0);
    const taxableAmount = subtotal - totalDiscount;
    const sgstAmount = (taxableAmount * sgstRate) / 100;
    const cgstAmount = (taxableAmount * cgstRate) / 100;
    const totalTax = sgstAmount + cgstAmount;
    const totalAmount = taxableAmount + totalTax;

    return {
      subtotal,
      totalDiscount,
      taxableAmount,
      sgstAmount,
      cgstAmount,
      totalTax,
      totalAmount,
    };
  }
}

export default PatientInvoiceService;
