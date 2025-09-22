/* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface DashboardDoctorReferralData {
  overview: {
    referrals: number;
    conversionRate: number;
    conversionRateChange: number;
    activeDoctors: number;
    avgPerDoctor: number;
    converted: number;
    newDoctors: number;
  };
  financialImpact: {
    commission: number;
    commissionRate: number;
    revenueChange: number;
    patientDiscounts: number;
    revenueGenerated: number;
  };
  topPerformers: {
    bestRate: number;
    topDoctors: Array<{
      doctorName: string;
      referrals: number;
      conversionRate: number;
    }>;
    avgConversion: number;
    newDoctorsAdded: number;
  };
  referralFlow: {
    referred: number;
    appointed: number;
    completed: number;
    converted: number;
    appointmentRate: number;
    completionRate: number;
    finalConversionRate: number;
    totalDropOff: number;
  };
  doctorPerformance: Array<{
    doctorName: string;
    specialization: string;
    totalReferrals: number;
    conversionRate: number;
  }>;
  commissionDistribution: {
    totalCommission: number;
    distribution: any[];
  };
}

export interface DashboardDiagnosticsData {
  overview: {
    testsCompleted: number;
    testsCompletedChange: number;
    pendingTests: number;
    avgTestTime: number;
    totalRevenue: number;
    revenueChange: number;
  };
  charts: {
    testTypesDistribution: Array<{
      type: string;
      count: number;
    }>;
    hearingLossDistribution: Array<{
      type: string;
      count: number;
    }>;
  };
  metrics: {
    totalAppointments: number;
    completionRate: number;
    avgRevenuePerTest: number;
  };
}

export interface DashboardBillingsData {
  overview: {
    totalRevenue: number;
    revenueChange: number;
    dailyAverage: number;
    perPatientRevenue: number;
    uniquePatients: number;
  };
  collection: {
    collectionRate: number;
    collectionChange: number;
    collectedAmount: number;
    outstandingAmount: number;
    sameDayRate: number;
    avgDaysToCollect: number;
    advancePayments: number;
  };
  transactions: {
    totalInvoices: number;
    avgInvoice: number;
    gstCollected: number;
    discountRate: number;
    commissionPaid: number;
    totalDiscount: number;
  };
  charts: {
    revenueTrend: Array<{
      month: string;
      amount: number;
    }>;
    serviceBreakdown: Array<{
      service: string;
      amount: number;
      percentage: number;
    }>;
    paymentMethods: Array<{
      method: string;
      amount: number;
      count: number;
      percentage: number;
    }>;
    ageDistribution: Array<{
      ageGroup: string;
      count: number;
      percentage: number;
    }>;
    collectionTimeline: {
      sameDay: number;
      within7Days: number;
      within30Days: number;
      avgDaysToCollect: number;
    };
  };
  metrics: {
    totalTransactions: number;
    avgTransactionAmount: number;
    digitalPaymentPercentage: number;
    seniorPatientPercentage: number;
  };
}

export interface DashboardInventoryData {
  overview: {
    totalInventoryValue: number;
    totalSkus: number;
    lowStockItems: number;
    outOfStockItems: number;
    expiringSoonItems: number;
    activeItems: number;
  };
  charts: {
    stockStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    stockTrend: Array<{
      category: string;
      monthlyData: Array<{
        month: string;
        value: number;
      }>;
    }>;
    bestSellingBrands: Array<{
      brand: string;
      quantity: number;
    }>;
    stockoutAnalysis: Array<{
      item: string;
      daysOutOfStock: number;
      impact: string;
    }>;
  };
  branchSummary: Array<{
    branchName: string;
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
  }>;
  categorySummary: Array<{
    category: string;
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  }>;
  metrics: {
    averageStockValue: number;
    inventoryTurnover: number;
    reorderAlerts: number;
    criticalItems: number;
  };
}

export interface DashboardResponse {
  status: string;
  data: {
    appointments?: DashboardAppointmentsData;
    doctorReferral?: DashboardDoctorReferralData;
    diagnostics?: DashboardDiagnosticsData;
    billings?: DashboardBillingsData;
    inventory?: DashboardInventoryData;
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
      
      console.log('Dashboard API URL:', url);

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

  static async getDoctorReferralData(startDate: string, endDate: string): Promise<DashboardDoctorReferralData | null> {
    try {
      const response = await this.getDashboardData(['doctorReferral'], startDate, endDate);
      return response.data.doctorReferral || null;
    } catch (error) {
      console.error('Error fetching doctor referral data:', error);
      return null;
    }
  }

  static async getDiagnosticsData(startDate: string, endDate: string): Promise<DashboardDiagnosticsData | null> {
    try {
      const response = await this.getDashboardData(['diagnostics'], startDate, endDate);
      return response.data.diagnostics || null;
    } catch (error) {
      console.error('Error fetching diagnostics data:', error);
      return null;
    }
  }

  static async getBillingsData(startDate: string, endDate: string): Promise<DashboardBillingsData | null> {
    try {
      const response = await this.getDashboardData(['billings'], startDate, endDate);
      return response.data.billings || null;
    } catch (error) {
      console.error('Error fetching billings data:', error);
      return null;
    }
  }

  static async getInventoryData(startDate: string, endDate: string): Promise<DashboardInventoryData | null> {
    try {
      const response = await this.getDashboardData(['inventory'], startDate, endDate);
      return response.data.inventory || null;
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      return null;
    }
  }
}

export const dashboardService = new DashboardService();
