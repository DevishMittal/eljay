import { ReferralSource, Appointment, Invoice } from '@/types';
import { appointmentService } from './appointmentService';
import InvoiceService from './invoiceService';
import { calculateCommission, calculateTotalCommission, formatCurrency } from '@/utils/commissionUtils';

export interface ReferralAnalytics {
  referralId: string;
  referralSource: ReferralSource;
  totalAppointments: number;
  totalRevenue: number;
  totalCommission: number;
  appointments: ReferralAppointment[];
  lastActivity: string;
}

export interface ReferralAppointment {
  id: string;
  date: string;
  patientName: string;
  procedures: string[];
  amount: number;
  commission: number;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface CommissionStatement {
  doctorId: string;
  doctorName: string;
  period: string;
  referrals: number;
  revenue: number;
  commission: number;
  status: 'draft' | 'sent' | 'paid';
  dueDate: string;
}

export interface ReferralTrends {
  month: string;
  referrals: number;
  revenue: number;
  commission: number;
}

export interface TopPerformingDoctor {
  doctorId: string;
  doctorName: string;
  specialization: string;
  referrals: number;
  revenue: number;
  commission: number;
}

class ReferralAnalyticsService {
  private BASE_URL = 'https://eljay-api.vizdale.com';

  /**
   * Get comprehensive referral analytics for all doctor referrals
   */
  async getReferralAnalytics(token?: string): Promise<ReferralAnalytics[]> {
    try {
      // Get all referrals
      const referralsResponse = await fetch(`${this.BASE_URL}/api/v1/referrals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!referralsResponse.ok) {
        throw new Error(`Failed to fetch referrals: ${referralsResponse.statusText}`);
      }

      const referralsData = await referralsResponse.json();
      const doctorReferrals = referralsData.data.filter((ref: ReferralSource) => ref.type === 'doctor');

      // Get appointments for each doctor referral
      const analyticsPromises = doctorReferrals.map(async (referral: ReferralSource) => {
        return this.getAnalyticsForReferral(referral, token);
      });

      const analytics = await Promise.all(analyticsPromises);
      return analytics;
    } catch (error) {
      console.error('Error fetching referral analytics:', error);
      throw error;
    }
  }

  /**
   * Get analytics for a specific referral
   */
  private async getAnalyticsForReferral(referral: ReferralSource, token?: string): Promise<ReferralAnalytics> {
    try {
      // Get appointments with this referral source
      const appointmentsResponse = await fetch(
        `${this.BASE_URL}/api/v1/appointments?referralSourceId=${referral.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }
      );

      let appointments: Appointment[] = [];
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        appointments = appointmentsData.data?.appointments || [];
      }

      // Calculate financial metrics
      const referralAppointments: ReferralAppointment[] = appointments.map(appointment => {
        const procedures = appointment.procedures.split(',').map(p => p.trim());
        const totalAmount = this.calculateAppointmentAmount(procedures);
        const commission = calculateCommission(totalAmount).commissionAmount;

        return {
          id: appointment.id,
          date: appointment.appointmentDate,
          patientName: appointment.user.fullname,
          procedures,
          amount: totalAmount,
          commission,
          status: 'completed' as const, // Assuming completed for now
        };
      });

      const totalRevenue = referralAppointments.reduce((sum, apt) => sum + apt.amount, 0);
      const totalCommission = referralAppointments.reduce((sum, apt) => sum + apt.commission, 0);
      const lastActivity = appointments.length > 0 
        ? Math.max(...appointments.map(apt => new Date(apt.createdAt).getTime()))
        : new Date(referral.createdAt || '').getTime();

      return {
        referralId: referral.id || '',
        referralSource: referral,
        totalAppointments: appointments.length,
        totalRevenue,
        totalCommission,
        appointments: referralAppointments,
        lastActivity: new Date(lastActivity).toISOString(),
      };
    } catch (error) {
      console.error(`Error getting analytics for referral ${referral.id}:`, error);
      return {
        referralId: referral.id || '',
        referralSource: referral,
        totalAppointments: 0,
        totalRevenue: 0,
        totalCommission: 0,
        appointments: [],
        lastActivity: referral.createdAt || '',
      };
    }
  }

  /**
   * Calculate appointment amount based on procedures
   */
  private calculateAppointmentAmount(procedures: string[]): number {
    // This would ideally come from the actual procedure pricing
    // For now, using mock calculation based on procedure names
    return procedures.reduce((total, procedure) => {
      const procedureLower = procedure.toLowerCase();
      
      // Mock pricing based on procedure types
      if (procedureLower.includes('hearing aid') || procedureLower.includes('audéo') || procedureLower.includes('phonak')) {
        return total + 50000; // Mock hearing aid price
      } else if (procedureLower.includes('audiometry') || procedureLower.includes('diagnostic')) {
        return total + 1000; // Mock diagnostic price
      } else {
        return total + 500; // Default price
      }
    }, 0);
  }

  /**
   * Get referral trends for charts
   */
  async getReferralTrends(token?: string): Promise<ReferralTrends[]> {
    try {
      const analytics = await this.getReferralAnalytics(token);
      
      // Group by month
      const monthlyData: { [key: string]: { referrals: number; revenue: number; commission: number } } = {};
      
      analytics.forEach(analyticsItem => {
        const date = new Date(analyticsItem.lastActivity);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { referrals: 0, revenue: 0, commission: 0 };
        }
        
        monthlyData[monthKey].referrals += analyticsItem.totalAppointments;
        monthlyData[monthKey].revenue += analyticsItem.totalRevenue;
        monthlyData[monthKey].commission += analyticsItem.totalCommission;
      });

      // Convert to array and sort by date
      const trends = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        referrals: data.referrals,
        revenue: data.revenue,
        commission: data.commission,
      }));

      return trends.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    } catch (error) {
      console.error('Error fetching referral trends:', error);
      return [];
    }
  }

  /**
   * Get top performing doctors
   */
  async getTopPerformingDoctors(token?: string, limit: number = 5): Promise<TopPerformingDoctor[]> {
    try {
      const analytics = await this.getReferralAnalytics(token);
      
      const doctorPerformance = analytics.map(analyticsItem => ({
        doctorId: analyticsItem.referralId,
        doctorName: analyticsItem.referralSource.sourceName,
        specialization: analyticsItem.referralSource.specialization || 'General',
        referrals: analyticsItem.totalAppointments,
        revenue: analyticsItem.totalRevenue,
        commission: analyticsItem.totalCommission,
      }));

      return doctorPerformance
        .sort((a, b) => b.referrals - a.referrals)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top performing doctors:', error);
      return [];
    }
  }

  /**
   * Generate commission statements
   */
  async generateCommissionStatements(token?: string): Promise<CommissionStatement[]> {
    try {
      const analytics = await this.getReferralAnalytics(token);
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      const statements = analytics.map(analyticsItem => ({
        doctorId: analyticsItem.referralId,
        doctorName: analyticsItem.referralSource.sourceName,
        period: currentMonth,
        referrals: analyticsItem.totalAppointments,
        revenue: analyticsItem.totalRevenue,
        commission: analyticsItem.totalCommission,
        status: analyticsItem.totalCommission > 0 ? 'draft' as const : 'sent' as const,
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15).toLocaleDateString('en-GB'),
      }));

      return statements.filter(stmt => stmt.referrals > 0);
    } catch (error) {
      console.error('Error generating commission statements:', error);
      return [];
    }
  }

  /**
   * Get summary statistics
   */
  async getSummaryStats(token?: string): Promise<{
    totalReferrals: number;
    totalDoctorReferrals: number;
    totalRevenue: number;
    totalCommission: number;
    pendingPayments: number;
    paidThisMonth: number;
  }> {
    try {
      // Get actual referral count from API
      const referralsResponse = await fetch(`${this.BASE_URL}/api/v1/referrals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      let totalReferrals = 0;
      let totalDoctorReferrals = 0;

      if (referralsResponse.ok) {
        const referralsData = await referralsResponse.json();
        const referrals = referralsData.data || [];
        totalReferrals = referrals.length;
        totalDoctorReferrals = referrals.filter((ref: ReferralSource) => ref.type === 'doctor').length;
      }

      // Get analytics for financial calculations
      const analytics = await this.getReferralAnalytics(token);
      const totalRevenue = analytics.reduce((sum, a) => sum + a.totalRevenue, 0);
      const totalCommission = analytics.reduce((sum, a) => sum + a.totalCommission, 0);
      
      // Mock pending and paid amounts for now
      const pendingPayments = totalCommission * 0.3; // 30% pending
      const paidThisMonth = totalCommission * 0.7; // 70% paid

      return {
        totalReferrals,
        totalDoctorReferrals,
        totalRevenue,
        totalCommission,
        pendingPayments,
        paidThisMonth,
      };
    } catch (error) {
      console.error('Error fetching summary stats:', error);
      return {
        totalReferrals: 0,
        totalDoctorReferrals: 0,
        totalRevenue: 0,
        totalCommission: 0,
        pendingPayments: 0,
        paidThisMonth: 0,
      };
    }
  }
}

export const referralAnalyticsService = new ReferralAnalyticsService();
