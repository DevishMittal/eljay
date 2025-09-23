import { BranchesResponse, BranchResponse, CreateBranchData, UpdateBranchData } from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class BranchService {
  async getBranches(page: number = 1, limit: number = 10, token?: string): Promise<BranchesResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}/api/v1/branches?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch branches: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async createBranch(data: CreateBranchData, token?: string): Promise<BranchResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}/api/v1/branches`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create branch: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async updateBranch(id: string, data: UpdateBranchData, token?: string): Promise<BranchResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}/api/v1/branches/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update branch: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async deleteBranch(id: string, token?: string): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}/api/v1/branches/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to delete branch: ${response.status} ${response.statusText}`);
    }
  }
}

const branchService = new BranchService();
export default branchService;




