import {
  ExpensesResponse,
  ExpenseResponse,
  Expense,
  CreateExpenseData,
  UpdateExpenseData
} from '@/types';

const API_BASE_URL = 'https://eljay-api.vizdale.com/api/v1';

class ExpenseService {
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

  static async getExpenses(page: number = 1, limit: number = 10): Promise<ExpensesResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Ensure parameters are integers
      const pageNum = Math.floor(Number(page)) || 1;
      const limitNum = Math.floor(Number(limit)) || 10;

      // Try with pagination parameters first
      let response = await fetch(`${API_BASE_URL}/expenses?pageNumber=${pageNum}&pageSize=${limitNum}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // If pagination fails, try without parameters
      if (!response.ok && response.status === 500) {
        console.warn('Pagination failed, trying without parameters...');
        response = await fetch(`${API_BASE_URL}/expenses`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

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
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  static async getExpense(id: string): Promise<ExpenseResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
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
      console.error('Error fetching expense:', error);
      throw error;
    }
  }

  static async createExpense(expenseData: CreateExpenseData): Promise<ExpenseResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
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
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  static async updateExpense(id: string, expenseData: UpdateExpenseData): Promise<ExpenseResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
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
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  static async deleteExpense(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
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
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Helper method to format expense data for display
  static formatExpenseForDisplay(expense: Expense) {
    return {
      ...expense,
      formattedDate: new Date(expense.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      formattedAmount: `₹${expense.amount.toLocaleString()}`,
      formattedTaxAmount: `₹${expense.amount.toLocaleString()}`,
      formattedTotalAmount: `₹${expense.totalAmount.toLocaleString()}`,
      formattedCreatedAt: new Date(expense.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }

  // Helper method to get expense categories
  static getExpenseCategories() {
    return [
      'Travel',
      'Marketing',
      'Supplies',
      'Equipment',
      'Office',
      'Utilities',
      'Insurance',
      'Training',
      'Maintenance',
      'Software'
    ];
  }

  // Helper method to get payment methods
  static getPaymentMethods() {
    return [
      'Cash',
      'Card',
      'Credit Card',
      'Cheque',
      'Netbanking'
    ];
  }
}

export default ExpenseService;
