/* eslint-disable @typescript-eslint/no-explicit-any */

const BASE_URL = 'https://eljay-api.vizdale.com';

export type TransferPatientRequest = {
  patientId: string;
  toBranchId: string;
  reason?: string;
};

export type BranchOption = {
  id: string;
  name: string;
  address?: string | null;
};

class PatientTransferService {
  async getAvailableBranches(patientId: string, token?: string): Promise<BranchOption[]> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${BASE_URL}/api/v1/patient-transfers/branches?patientId=${encodeURIComponent(patientId)}`;
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to load branches: ${res.status} ${res.statusText} ${text}`);
    }
    const data = await res.json();
    return (data?.data ?? []) as BranchOption[];
  }

  async transferPatient(payload: TransferPatientRequest, token?: string): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/api/v1/patient-transfers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to transfer patient: ${res.status} ${res.statusText} ${text}`);
    }
    return res.json();
  }
}

export const patientTransferService = new PatientTransferService();
export default PatientTransferService;


