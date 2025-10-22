/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthService } from './authService';

const API_BASE_URL = 'https://eljay-api.vizdale.com/api/v1';

// TypeScript interfaces for SuperAdmin dashboard data
export interface RevenueAnalyticsData {
  hearingAidRevenueByCentre: Array<{
    branch: string;
    revenue: number;
  }>;
  diagnosticsRevenueByCentre: Array<{
    branch: string;
    hearing: number;
    pediatric: number;
    vertigo: number;
  }>;
  branchPerformanceStats: {
    totalUnitsSold: number;
    totalRevenue: number;
    avgUnitPrice: number;
  };
  hearingAidVolumeByBranch: Array<{
    branch: string;
    volume: number;
  }>;
  hearingAidRevenueByBranch: Array<{
    branch: string;
    revenue: number;
  }>;
}

export interface OperationsData {
  headerCards: {
    revenuePerformance: {
      amount: number;
      monthlyGrowthPct: number;
      haSharePct: number;
    };
    totalActivePatients: {
      count: number;
      growthPct: number;
    };
    invoiceCollectionRate: {
      ratePct: number;
      improvementPct: number;
    };
  };
  topCards: {
    totals: {
      diagnosticReferrals: number;
      hearingAidReferrals: number;
      totalReferrals: number;
      diagnosticRevenue: number;
      hearingAidRevenue: number;
      totalRevenue: number;
    };
  };
  branchEfficiencyComparison: any[];
  keyEfficiencyInsights: any[];
  referralVolumeByBranch: Array<{
    branch: string;
    diagnostics: number;
    hearingAid: number;
  }>;
  referralRevenueByBranch: Array<{
    branch: string;
    diagnostics: number;
    hearingAid: number;
    total: number;
  }>;
  detailedBranchPerformance: Array<{
    branch: string;
    diagVol: number;
    haVol: number;
    totalRef: number;
    diagRev: number;
    haRev: number;
    totalRev: number;
    conversionRate: number;
    topDoctor: string;
  }>;
  bdmPortfolio: {
    summary: {
      activeBDMs: number;
      totalRevenue: number;
      avgAchievement: number;
      doctorsManaged: number;
      newAcquisitions: number;
    };
    revenuePerformanceVsTargets: Array<{
      name: string;
      actual: number;
      target: number;
    }>;
    table: {
      rows: Array<{
        bdm: string;
        branches: number;
        revenue: number;
        hearingAidRevenue: number;
        doctors: number;
        newAcq: number;
        avgPerDoctor: number;
        contributionPct?: number;
      }>;
      networkTotal: {
        branches: number;
        revenue: number;
        hearingAidRevenue: number;
        contributionPct: number;
        doctors: number;
        newAcq: number;
        avgPerDoctor: number;
      };
    };
  };
}

export interface BusinessIntelligenceData {
  diagnosticMetrics: {
    hearingRevenue: number;
    pediatricRevenue: number;
    vertigoRevenue: number;
    totalRevenue: number;
    hearingTestCount: number;
    pediatricTestCount: number;
    vertigoTestCount: number;
  };
  testVolumeByBranch: Array<{
    branch: string;
    hearing: number;
    pediatric: number;
    vertigo: number;
    total: number;
  }>;
  testRevenueByBranch: Array<{
    branch: string;
    hearing: number;
    pediatric: number;
    vertigo: number;
    total: number;
  }>;
  branchPerformance: Array<{
    branch: string;
    hearingVolume: number;
    pediatricVolume: number;
    vertigoVolume: number;
    hearingRevenue: number;
    pediatricRevenue: number;
    vertigoRevenue: number;
    totalRevenue: number;
  }>;
  diagnosticServices: Array<{
    service: string;
    revenue: number;
    category: string;
  }>;
  serviceAnalysis: {
    serviceName: string;
    totalRevenue: number;
    monthlyGrowth: number;
    branchDistribution: Array<{
      branch: string;
      revenue: number;
      percentage: number;
    }>;
  };
  businessMetrics: {
    totalActivePatients: number;
    averageTransactionValue: number;
    invoiceCollectionRate: number;
    patientRetentionRate: number;
  };
}

export interface PerformanceMetricsData {
  diagnosisVsConsultScatter: Array<{
    date: string;
    type: string;
    revenue: number;
  }>;
  providerOverview: {
    totalConsult: number;
    appointmentConfirmations: number;
    completedBeforeTime: number;
    annualRevenueOnline: number;
  };
  hospitalPerformanceOverview: {
    totalHospitals: number;
    totalRevenue: number;
    totalTests: number;
    topPerformers: Array<{
      name: string;
      revenue: number;
    }>;
  };
  hearingAidSalesByChannels: {
    pie: Array<{
      name: string;
      percentage: number;
      units: number;
    }>;
    trends: Array<{
      month: string;
      directWalkIns: number;
      doctorReferral: number;
      hearsum: number;
    }>;
  };
  conversionFunnel: {
    stages: Array<{
      name: string;
      count: number;
    }>;
    branchWise: Array<{
      branch: string;
      hatTrials: number;
      finalPurchases: number;
    }>;
  };
  funnel: {
    totalAppointments: number;
    completedConsultations: number;
    hatTrials: number;
    purchasesCompleted: number;
  };
  branchCards: {
    totalRevenue: number;
    availableUnits: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  stockStatusDistributionByBranch: Array<{
    branch: string;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  }>;
  stockLevelByCategory: Array<{
    category: string;
    currentStock: number;
  }>;
}

export interface SuperAdminDashboardData {
  revenueAnalytics?: RevenueAnalyticsData & OperationsData & BusinessIntelligenceData;
  performanceMetrics?: PerformanceMetricsData;
  operations?: OperationsData;
  businessIntelligence?: BusinessIntelligenceData;
}

export class SuperAdminDashboardService {
  static async getSuperAdminDashboard(
    sections: string[],
    startDate: string,
    endDate: string
  ): Promise<SuperAdminDashboardData> {
    const { token } = AuthService.getAuthData();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams({
      sections: sections.join(','),
      startDate,
      endDate,
    });

    const response = await fetch(`${API_BASE_URL}/super-admin/dashboard?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to fetch SuperAdmin dashboard data');
    }

    return result.data;
  }

  // Helper method to get specific section data
  static async getRevenueAnalytics(startDate: string, endDate: string): Promise<RevenueAnalyticsData> {
    const data = await this.getSuperAdminDashboard(['revenueAnalytics'], startDate, endDate);
    if (!data.revenueAnalytics) {
      throw new Error('Revenue analytics data not available');
    }
    return data.revenueAnalytics;
  }

  static async getOperations(startDate: string, endDate: string): Promise<OperationsData> {
    const data = await this.getSuperAdminDashboard(['operations'], startDate, endDate);
    if (!data.operations) {
      throw new Error('Operations data not available');
    }
    return data.operations;
  }

  static async getBusinessIntelligence(startDate: string, endDate: string): Promise<BusinessIntelligenceData> {
    const data = await this.getSuperAdminDashboard(['businessIntelligence'], startDate, endDate);
    if (!data.businessIntelligence) {
      throw new Error('Business intelligence data not available');
    }
    return data.businessIntelligence;
  }

  static async getPerformanceMetrics(startDate: string, endDate: string): Promise<PerformanceMetricsData> {
    const data = await this.getSuperAdminDashboard(['performanceMetrics'], startDate, endDate);
    if (!data.performanceMetrics) {
      throw new Error('Performance metrics data not available');
    }
    return data.performanceMetrics;
  }
}
