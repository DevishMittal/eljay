/* eslint-disable @typescript-eslint/no-explicit-any */
import { DiagnosticsResponse, DiagnosticResponse, CreateDiagnosticData, UpdateDiagnosticData } from '@/types';

const BASE_URL = 'https://eljay-api.vizdale.com';

class DiagnosticsService {
  async getDiagnostics(token?: string): Promise<DiagnosticsResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/organizations/diagnostics`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch diagnostics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
      throw error;
    }
  }

  async createDiagnostic(data: CreateDiagnosticData, token?: string): Promise<DiagnosticResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/organizations/diagnostics`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create diagnostic: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating diagnostic:', error);
      throw error;
    }
  }

  async updateDiagnostic(id: string, data: UpdateDiagnosticData, token?: string): Promise<DiagnosticResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/organizations/diagnostics/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update diagnostic: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating diagnostic:', error);
      throw error;
    }
  }

  async deleteDiagnostic(id: string, token?: string): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/v1/organizations/diagnostics/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete diagnostic: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting diagnostic:', error);
      throw error;
    }
  }
}

export default new DiagnosticsService();