import { InventoryItem, InventoryTransaction, ApiResponse, PaginatedResponse, InventoryViewResponse } from '@/types';

const API_BASE_URL = 'https://eljay-api.vizdale.com/api/v1';

export class InventoryService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Get all inventory items with pagination
  static async getInventoryItems(page: number = 1, limit: number = 10): Promise<PaginatedResponse<InventoryItem>> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse<PaginatedResponse<InventoryItem>> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  }

  // Get inventory items with branch/network view
  static async getInventoryItemsWithView(
    view: 'branch' | 'network' = 'branch',
    page: number = 1,
    limit: number = 10,
    branchName?: string
  ): Promise<InventoryViewResponse['data']> {
    try {
      const params = new URLSearchParams({
        view,
        page: page.toString(),
        limit: limit.toString(),
        ...(branchName && branchName !== 'All Branches' && { branchName })
      });

      const response = await fetch(`${API_BASE_URL}/inventory/v2?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory with view: ${response.status} ${response.statusText}`);
      }

      const data: InventoryViewResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching inventory items with view:', error);
      throw error;
    }
  }

  // Get a single inventory item by ID
  static async getInventoryItem(id: string): Promise<InventoryItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory item: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse<InventoryItem> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  }

  // Create a new inventory item
  static async createInventoryItem(item: Omit<InventoryItem, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`Failed to create inventory item: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse<InventoryItem> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  }

  // Update an existing inventory item
  static async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update inventory item: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse<InventoryItem> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }

  // Delete an inventory item
  static async deleteInventoryItem(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete inventory item: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  }

  // Get inventory transactions
  static async getInventoryTransactions(page: number = 1, limit: number = 10): Promise<{
    transactions: InventoryTransaction[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/transactions?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory transactions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw API response:', data); // Debug log
      
      // Return the data directly since the API structure is different from PaginatedResponse
      return data.data;
    } catch (error) {
      console.error('Error fetching inventory transactions:', error);
      throw error;
    }
  }

  // Update stock (add/consume)
  static async updateStock(
    itemId: string, 
    quantity: number, 
    action: 'add' | 'consume',
    additionalData?: {
      batchNumber?: string;
      expiryDate?: string;
      supplierName?: string;
      supplierContact?: string;
      purchasePrice?: number;
      warranty?: string;
      authorizedBy?: string;
    }
  ): Promise<InventoryItem> {
    try {
      const payload = {
        quantity,
        action,
        ...additionalData,
      };

      const response = await fetch(`${API_BASE_URL}/inventory/${itemId}/stock`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update stock: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse<InventoryItem> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }
}
