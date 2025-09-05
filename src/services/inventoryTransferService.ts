import { InventoryTransfer, CreateTransferData, TransfersResponse, TransferResponse } from '@/types';

const API_BASE_URL = 'https://eljay-api.vizdale.com/api/v1';

export class InventoryTransferService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Get all inventory transfers with pagination
  static async getInventoryTransfers(page: number = 1, limit: number = 10): Promise<TransfersResponse['data']> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-transfers?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory transfers: ${response.status} ${response.statusText}`);
      }

      const data: TransfersResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching inventory transfers:', error);
      throw error;
    }
  }

  // Get a single inventory transfer by ID
  static async getInventoryTransfer(id: string): Promise<InventoryTransfer> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-transfers/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory transfer: ${response.status} ${response.statusText}`);
      }

      const data: TransferResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching inventory transfer:', error);
      throw error;
    }
  }

  // Create a new inventory transfer
  static async createInventoryTransfer(transferData: CreateTransferData): Promise<InventoryTransfer> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-transfers`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create inventory transfer: ${response.status} ${response.statusText}`);
      }

      const data: TransferResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating inventory transfer:', error);
      throw error;
    }
  }

  // Update an existing inventory transfer
  static async updateInventoryTransfer(id: string, updates: Partial<CreateTransferData>): Promise<InventoryTransfer> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-transfers/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update inventory transfer: ${response.status} ${response.statusText}`);
      }

      const data: TransferResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating inventory transfer:', error);
      throw error;
    }
  }

  // Delete an inventory transfer
  static async deleteInventoryTransfer(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-transfers/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete inventory transfer: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting inventory transfer:', error);
      throw error;
    }
  }
}
