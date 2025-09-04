import { AuthService } from './authService';

const API_BASE_URL = 'https://eljay-api.vizdale.com/api/v1';

export interface DashboardAppointmentsData {
  overview: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    completionRate: number;
  };
  performance: {
    attendanceRate: number;
    repeatPatients: number;
    noShowRate: number;
    avgLeadDays: number;
    targetAchievement: number;
  };
  utilization: {
    overall: number;
    audiologistAvg: number;
    peakHour: number;
  };
  statusDistribution: {
    COMPLETED: number;
    PENDING: number;
    CANCELLED: number;
    NO_SHOW: number;
  };
  trends: {
    lastSixMonths: Array<{
      month: string;
      count: number;
    }>;
    attendanceRate: Array<{
      month: string;
      monthLabel: string;
      attendanceRate: number;
      target: number;
    }>;
  };
  audiologistPerformance: Array<{
    audiologistId: string;
    audiologistName: string;
    count: number;
  }>;
  channelDistribution: Array<{
    referralSourceId: string | null;
    name: string;
    count: number;
  }>;
  leadTimeHistogram: {
    '0-1': number;
    '2-3': number;
    '4-7': number;
    '8-14': number;
    '15+': number;
  };
}

export interface DashboardResponse {
  status: string;
  data: {
    appointments?: DashboardAppointmentsData;
    doctorReferral?: any;
    diagnostics?: any;
    billings?: any;
    inventory?: any;
  };
}

export class DashboardService {
  static async getDashboardData(
    sections: string[],
    startDate: string,
    endDate: string
  ): Promise<DashboardResponse> {
    try {
      const { token } = AuthService.getAuthData();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const sectionsParam = sections.join(',');
      const url = `${API_BASE_URL}/dashboard?sections=${sectionsParam}&startDate=${startDate}&endDate=${endDate}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`);
      }

      const data: DashboardResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  static async getAppointmentsData(startDate: string, endDate: string): Promise<DashboardAppointmentsData | null> {
    try {
      const response = await this.getDashboardData(['appointments'], startDate, endDate);
      return response.data.appointments || null;
    } catch (error) {
      console.error('Error fetching appointments data:', error);
      return null;
    }
  }
}

export const dashboardService = new DashboardService();
